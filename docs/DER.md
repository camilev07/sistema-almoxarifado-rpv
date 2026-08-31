# DER — Sistema de Gestão de Almoxarifado

Modelo de entidades e relacionamentos do banco de dados `almoxarifado` (MySQL 8).

## Tabelas

### alunos
| Campo     | Tipo          | Restrições |
|-----------|---------------|------------|
| id        | INT           | PK, AUTO_INCREMENT |
| nome      | VARCHAR(120)  | NOT NULL |
| matricula | VARCHAR(20)   | NOT NULL, UNIQUE |

### equipamentos
| Campo               | Tipo                              | Restrições |
|---------------------|-----------------------------------|------------|
| id                  | INT                               | PK, AUTO_INCREMENT |
| nome                | VARCHAR(120)                      | NOT NULL |
| numero_patrimonio   | VARCHAR(30)                       | NOT NULL, UNIQUE |
| status              | ENUM('disponivel','emprestado','manutencao') | NOT NULL, DEFAULT 'disponivel' |

### emprestimos
| Campo            | Tipo     | Restrições |
|------------------|----------|------------|
| id               | INT      | PK, AUTO_INCREMENT |
| aluno_id         | INT      | FK → alunos.id |
| equipamento_id   | INT      | FK → equipamentos.id |
| data_retirada    | DATETIME | NOT NULL |
| data_limite      | DATETIME | NOT NULL |
| data_devolucao   | DATETIME | NULL (NULL = em andamento) |

## Relacionamento

```
alunos (1) ───< (N) emprestimos >─── (1) equipamentos
```

- **alunos 1:N emprestimos** — um aluno pode ter vários empréstimos.
- **equipamentos 1:N emprestimos** — um equipamento pode aparecer em vários empréstimos (ao longo do tempo).
- `emprestimos` é a tabela associativa (N:N) que mantém o **histórico imutável**.

## Regras de negócio refletidas no modelo

1. **Sem DELETE:** um empréstimo finalizado nunca é apagado. A conclusão é representada pelo preenchimento de `data_devolucao` (soft close). O histórico permanece para auditoria (ex.: defeito descoberto depois).
2. **Status do equipamento:** `disponivel` → só é liberado no empréstimo; `emprestado` (durante um empréstimo ativo); `manutencao` (fora de circulação).
3. **Empréstimo válido:** só pode ocorrer se o equipamento tiver `status = 'disponivel'`. Isso é validado na API e refletido no frontend (que lista apenas equipamentos disponíveis).
4. **Atraso:** empréstimo está em atraso quando `data_devolucao IS NULL` e `data_limite < NOW()`.
```