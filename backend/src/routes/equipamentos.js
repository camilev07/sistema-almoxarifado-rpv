const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM equipamentos ORDER BY nome ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/disponiveis', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM equipamentos WHERE status = 'disponivel' ORDER BY nome ASC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { nome, numero_patrimonio, status } = req.body;
  if (!nome || !numero_patrimonio) {
    return res.status(400).json({ error: 'Nome e número de patrimônio são obrigatórios.' });
  }
  const novoStatus = ['disponivel', 'emprestado', 'manutencao'].includes(status) ? status : 'disponivel';
  try {
    const [result] = await pool.query(
      'INSERT INTO equipamentos (nome, numero_patrimonio, status) VALUES (?, ?, ?)',
      [nome, numero_patrimonio, novoStatus]
    );
    const [novo] = await pool.query('SELECT * FROM equipamentos WHERE id = ?', [result.insertId]);
    res.status(201).json(novo[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Número de patrimônio já cadastrado.' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { nome, numero_patrimonio, status } = req.body;
  if (!nome || !numero_patrimonio) {
    return res.status(400).json({ error: 'Nome e número de patrimônio são obrigatórios.' });
  }
  const novoStatus = ['disponivel', 'emprestado', 'manutencao'].includes(status) ? status : 'disponivel';
  try {
    const [result] = await pool.query(
      'UPDATE equipamentos SET nome = ?, numero_patrimonio = ?, status = ? WHERE id = ?',
      [nome, numero_patrimonio, novoStatus, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Equipamento não encontrado.' });
    }
    const [linhas] = await pool.query('SELECT * FROM equipamentos WHERE id = ?', [req.params.id]);
    res.json(linhas[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Número de patrimônio já cadastrado.' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['disponivel', 'emprestado', 'manutencao'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido.' });
  }
 
  if (status === 'disponivel') {
    const [ativos] = await pool.query(
      'SELECT COUNT(*) AS total FROM emprestimos WHERE equipamento_id = ? AND data_devolucao IS NULL',
      [req.params.id]
    );
    if (ativos[0].total > 0) {
      return res.status(409).json({ error: 'Equipamento possui empréstimo ativo e não pode ser marcado como disponível.' });
    }
  }
  try {
    const [result] = await pool.query(
      'UPDATE equipamentos SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Equipamento não encontrado.' });
    }
    const [linhas] = await pool.query('SELECT * FROM equipamentos WHERE id = ?', [req.params.id]);
    res.json(linhas[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [historico] = await conn.query(
      'SELECT COUNT(*) AS total FROM emprestimos WHERE equipamento_id = ?',
      [req.params.id]
    );
    if (historico[0].total > 0) {
      await conn.rollback();
      return res.status(409).json({ error: 'Equipamento possui histórico de empréstimos e não pode ser removido.' });
    }
    const [result] = await conn.query('DELETE FROM equipamentos WHERE id = ?', [req.params.id]);
    await conn.commit();
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Equipamento não encontrado.' });
    }
    res.status(204).send();
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;