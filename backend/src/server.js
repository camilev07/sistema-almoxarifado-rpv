const express = require('express');
const cors = require('cors');
require('dotenv').config();

const alunosRouter = require('./routes/alunos');
const equipamentosRouter = require('./routes/equipamentos');
const emprestimosRouter = require('./routes/emprestimos');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/alunos', alunosRouter);
app.use('/api/equipamentos', equipamentosRouter);
app.use('/api/emprestimos', emprestimosRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`API do Almoxarifado rodando em http://localhost:${PORT}`);
});