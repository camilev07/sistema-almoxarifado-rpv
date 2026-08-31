-- ============================================================
-- SISTEMA DE GESTÃO DE ALMOXARIFADO
-- Script de criação do banco de dados (MySQL 8)
-- Execute este arquivo para criar o banco e as tabelas.
-- ============================================================

CREATE DATABASE IF NOT EXISTS almoxarifado
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE almoxarifado;

-- ------------------------------------------------------------
-- Tabela: alunos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alunos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  matricula VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabela: equipamentos
-- status: disponivel | emprestado | manutencao
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  numero_patrimonio VARCHAR(30) NOT NULL UNIQUE,
  status ENUM('disponivel','emprestado','manutencao') NOT NULL DEFAULT 'disponivel'
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Tabela: emprestimos (histórico imutável)
-- data_devolucao NULL => empréstimo em andamento
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emprestimos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aluno_id INT NOT NULL,
  equipamento_id INT NOT NULL,
  data_retirada DATETIME NOT NULL,
  data_limite DATETIME NOT NULL,
  data_devolucao DATETIME NULL,
  CONSTRAINT fk_emprestimo_aluno FOREIGN KEY (aluno_id)
    REFERENCES alunos(id) ON DELETE RESTRICT,
  CONSTRAINT fk_emprestimo_equipamento FOREIGN KEY (equipamento_id)
    REFERENCES equipamentos(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Índices para consultas frequentes (atrasados, ativos, histórico)
CREATE INDEX idx_emprestimo_aluno ON emprestimos (aluno_id);
CREATE INDEX idx_emprestimo_equipamento ON emprestimos (equipamento_id);
CREATE INDEX idx_emprestimo_limite ON emprestimos (data_limite);