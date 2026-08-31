const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const sql = `
    SELECT e.id, e.data_retirada, e.data_limite, e.data_devolucao,
           a.id AS aluno_id, a.nome AS aluno_nome, a.matricula,
           eq.id AS equipamento_id, eq.nome AS equipamento_nome, eq.numero_patrimonio
    FROM emprestimos e
    JOIN alunos a ON a.id = e.aluno_id
    JOIN equipamentos eq ON eq.id = e.equipamento_id
    ORDER BY e.data_retirada DESC
  `;
  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/ativos', async (req, res) => {
  const sql = `
    SELECT e.id, e.data_retirada, e.data_limite, e.data_devolucao,
           a.id AS aluno_id, a.nome AS aluno_nome, a.matricula,
           eq.id AS equipamento_id, eq.nome AS equipamento_nome, eq.numero_patrimonio
    FROM emprestimos e
    JOIN alunos a ON a.id = e.aluno_id
    JOIN equipamentos eq ON eq.id = e.equipamento_id
    WHERE e.data_devolucao IS NULL
    ORDER BY e.data_limite ASC
  `;
  try {
    const [rows] = await pool.query(sql);
    const agora = new Date();
    const comAtraso = rows.map((r) => ({
      ...r,
      atrasado: new Date(r.data_limite) < agora
    }));
    res.json(comAtraso);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/atrasados', async (req, res) => {
  const sql = `
    SELECT e.id, e.data_retirada, e.data_limite, e.data_devolucao,
           a.id AS aluno_id, a.nome AS aluno_nome, a.matricula,
           eq.id AS equipamento_id, eq.nome AS equipamento_nome, eq.numero_patrimonio
    FROM emprestimos e
    JOIN alunos a ON a.id = e.aluno_id
    JOIN equipamentos eq ON eq.id = e.equipamento_id
    WHERE e.data_devolucao IS NULL AND e.data_limite < NOW()
    ORDER BY e.data_limite ASC
  `;
  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/historico', async (req, res) => {
  const sql = `
    SELECT e.id, e.data_retirada, e.data_limite, e.data_devolucao,
           a.id AS aluno_id, a.nome AS aluno_nome, a.matricula,
           eq.id AS equipamento_id, eq.nome AS equipamento_nome, eq.numero_patrimonio
    FROM emprestimos e
    JOIN alunos a ON a.id = e.aluno_id
    JOIN equipamentos eq ON eq.id = e.equipamento_id
    ORDER BY e.data_retirada DESC
  `;
  try {
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { aluno_id, equipamento_id, data_limite } = req.body;
  if (!aluno_id || !equipamento_id || !data_limite) {
    return res.status(400).json({ error: 'Aluno, equipamento e data limite são obrigatórios.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [aluno] = await conn.query('SELECT * FROM alunos WHERE id = ?', [aluno_id]);
    if (aluno.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Aluno não encontrado.' });
    }

    const [equip] = await conn.query(
      'SELECT * FROM equipamentos WHERE id = ? FOR UPDATE',
      [equipamento_id]
    );
    if (equip.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Equipamento não encontrado.' });
    }

    if (equip[0].status !== 'disponivel') {
      await conn.rollback();
      return res.status(400).json({
        error: `Equipamento não está disponível para empréstimo (status atual: ${equip[0].status}).`
      });
    }

    const dataRetirada = new Date();
    const dataLimite = new Date(data_limite);
    if (dataLimite <= dataRetirada) {
      await conn.rollback();
      return res.status(400).json({ error: 'A data limite deve ser posterior à data de retirada.' });
    }

    const [result] = await conn.query(
      `INSERT INTO emprestimos (aluno_id, equipamento_id, data_retirada, data_limite)
       VALUES (?, ?, ?, ?)`,
      [aluno_id, equipamento_id, dataRetirada, dataLimite]
    );

    await conn.query(
      "UPDATE equipamentos SET status = 'emprestado' WHERE id = ?",
      [equipamento_id]
    );

    await conn.commit();

    const [novo] = await conn.query(
      `SELECT e.id, e.data_retirada, e.data_limite, e.data_devolucao,
              a.nome AS aluno_nome, eq.nome AS equipamento_nome
       FROM emprestimos e
       JOIN alunos a ON a.id = e.aluno_id
       JOIN equipamentos eq ON eq.id = e.equipamento_id
       WHERE e.id = ?`,
      [result.insertId]
    );
    res.status(201).json(novo[0]);
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

router.put('/:id/devolucao', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [emp] = await conn.query(
      'SELECT * FROM emprestimos WHERE id = ? FOR UPDATE',
      [req.params.id]
    );
    if (emp.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Empréstimo não encontrado.' });
    }
    if (emp[0].data_devolucao !== null) {
      await conn.rollback();
      return res.status(409).json({ error: 'Empréstimo já devolvido.' });
    }

    await conn.query(
      'UPDATE emprestimos SET data_devolucao = NOW() WHERE id = ?',
      [req.params.id]
    );

    const [historicoAtivo] = await conn.query(
      `SELECT COUNT(*) AS total FROM emprestimos
       WHERE equipamento_id = ? AND data_devolucao IS NULL`,
      [emp[0].equipamento_id]
    );
    if (historicoAtivo[0].total === 0) {
      await conn.query(
        "UPDATE equipamentos SET status = 'disponivel' WHERE id = ?",
        [emp[0].equipamento_id]
      );
    }

    await conn.commit();

    const [atualizado] = await conn.query(
      `SELECT e.id, e.data_retirada, e.data_limite, e.data_devolucao,
              a.nome AS aluno_nome, eq.nome AS equipamento_nome
       FROM emprestimos e
       JOIN alunos a ON a.id = e.aluno_id
       JOIN equipamentos eq ON eq.id = e.equipamento_id
       WHERE e.id = ?`,
      [req.params.id]
    );
    res.json(atualizado[0]);
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;