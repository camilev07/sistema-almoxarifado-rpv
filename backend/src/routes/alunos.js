const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM alunos ORDER BY nome ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { nome, matricula } = req.body;
  if (!nome || !matricula) {
    return res.status(400).json({ error: 'Nome e matrícula são obrigatórios.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO alunos (nome, matricula) VALUES (?, ?)',
      [nome, matricula]
    );
    const [novo] = await pool.query('SELECT * FROM alunos WHERE id = ?', [result.insertId]);
    res.status(201).json(novo[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Matrícula já cadastrada.' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { nome, matricula } = req.body;
  if (!nome || !matricula) {
    return res.status(400).json({ error: 'Nome e matrícula são obrigatórios.' });
  }
  try {
    const [result] = await pool.query(
      'UPDATE alunos SET nome = ?, matricula = ? WHERE id = ?',
      [nome, matricula, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado.' });
    }
    const [linhas] = await pool.query('SELECT * FROM alunos WHERE id = ?', [req.params.id]);
    res.json(linhas[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Matrícula já cadastrada.' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [historico] = await conn.query(
      'SELECT COUNT(*) AS total FROM emprestimos WHERE aluno_id = ?',
      [req.params.id]
    );
    if (historico[0].total > 0) {
      await conn.rollback();
      return res.status(409).json({ error: 'Aluno possui histórico de empréstimos e não pode ser removido.' });
    }
    const [result] = await conn.query('DELETE FROM alunos WHERE id = ?', [req.params.id]);
    await conn.commit();
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Aluno não encontrado.' });
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