-- ============================================================
-- SISTEMA DE GESTÃO DE ALMOXARIFADO
-- Dados de exemplo (seed)
-- Execute APÓS o schema.sql.
-- ============================================================

USE almoxarifado;

-- Alunos
INSERT INTO alunos (nome, matricula) VALUES
  ('Ana Souza', '2024001'),
  ('Bruno Lima', '2024002'),
  ('Carla Mendes', '2024003'),
  ('Diego Rocha', '2024004'),
  ('Elisa Castro', '2024005');

-- Equipamentos
INSERT INTO equipamentos (nome, numero_patrimonio, status) VALUES
  ('Notebook Dell Latitude 5420', 'PAT-0001', 'disponivel'),
  ('Notebook Lenovo ThinkPad T14', 'PAT-0002', 'disponivel'),
  ('Multímetro Digital Fluke 117', 'PAT-0003', 'disponivel'),
  ('Multímetro Minipa ET-2042', 'PAT-0004', 'manutencao'),
  ('Kit de Robótica Lego EV3', 'PAT-0005', 'disponivel'),
  ('Kit de Robótica Arduino Uno', 'PAT-0006', 'disponivel'),
  ('Notebook Samsung Book 2', 'PAT-0007', 'emprestado'),
  ('Multímetro Fluke 87-V', 'PAT-0008', 'disponivel');

-- Empréstimos de exemplo (histórico)
-- Em andamento (sem data_devolucao)
INSERT INTO emprestimos (aluno_id, equipamento_id, data_retirada, data_limite, data_devolucao) VALUES
  (3, 7, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 1 DAY, NULL),   -- ATRASADO
  (1, 1, NOW() - INTERVAL 3 DAY, NOW() + INTERVAL 4 DAY, NULL);  -- em dia

-- Finalizados (com data_devolucao) - histórico preservado
INSERT INTO emprestimos (aluno_id, equipamento_id, data_retirada, data_limite, data_devolucao) VALUES
  (2, 3, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 13 DAY, NOW() - INTERVAL 12 DAY),
  (4, 5, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 3 DAY,  NOW() - INTERVAL 1 DAY);