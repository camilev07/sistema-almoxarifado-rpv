# 📦 Sistema de Gestão de Almoxarifado

Aplicação web **Fullstack** para digitalizar o controle de empréstimos de equipamentos
(notebooks, multímetros e kits de robótica) em um almoxarifado escolar.

**Stack:** Next.js (SPA) + Express (API) + MySQL 8.

---

## Arquitetura

```
frontend  (Next.js, http://localhost:3000)  →  backend (Express, http://localhost:3001)  →  MySQL (banco almoxarifado)
```

- **Frontend:** SPA em Next.js (App Router) que consome a API via JSON.
- **Backend:** API REST Express com CORS e pool de conexões (`mysql2`).

## Estrutura

```
├── database/
│   ├── schema.sql      # criação do banco e tabelas
│   └── seed.sql        # dados de exemplo
├── backend/
│   ├── src/
│   │   ├── server.js   # bootstrap da API
│   │   ├── db.js       # conexão MySQL
│   │   └── routes/     # alunos, equipamentos, emprestimos
│   ├── .env            # credenciais do banco (não comitar)
│   ├── .env.example
│   └── routes.http     # mapeamento de rotas (REST Client)
├── frontend/
│   └── src/app/        # páginas (Dashboard, Alunos, Equipamentos, Empréstimos, Histórico)
└── docs/DER.md         # modelo de entidades e relacionamentos
```

## Pré-requisitos

- Node.js ≥ 18
- MySQL 8 (serviço rodando)
- Cliente `mysql` no ambiente (ou caminho completo)

## Como rodar

### 1. Banco de dados

Configure a senha do MySQL no arquivo `backend\.env` (ou renomeie `.env.example`).

```bash
cd backend
cp .env.example .env   # edite DB_USER / DB_PASSWORD
```

Crie o banco e carregue os dados de exemplo:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Backend (API)

```bash
cd backend
npm install
npm run dev          # → http://localhost:3001
```

Verifique: `GET http://localhost:3001/api/health` → `{ "status": "ok" }`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev          # → http://localhost:3000
```

> A URL da API é configurável via env `NEXT_PUBLIC_API_BASE` (padrão `http://localhost:3001/api`).

### Iniciar Front + Backend de uma vez (modo dev)

Na raiz do projeto:

```bash
npm install          # instala o concurrently (orquestrador)
npm run dev:all      # inicia API (:3001) e FRONTEND (:3000) juntos
```

O `dev:all` usa a ferramenta `concurrently` para executar os dois servidores em paralelo,
com prefixos coloridos `[API]` e `[FRONTEND]` no terminal. A flag `-k` garante que, se um
dos processos for encerrado, o outro também é. Para instalar as dependências de ambos os
subprojetos de uma vez: `npm run install:all`.

## Rotas da API (resumo)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/equipamentos/disponiveis` | Somente equipamentos no almoxarifado (formulário de empréstimo) |
| POST | `/api/emprestimos` | Registra empréstimo (**só se status = disponível**) |
| PUT | `/api/emprestimos/:id/devolucao` | Registra devolução e libera o equipamento |
| GET | `/api/emprestimos/atrasados` | Empréstimos em atraso (Dashboard) |
| GET | `/api/emprestimos/historico` | Histórico imutável (nunca usa DELETE) |

Arquivo completo e testável: `backend/routes.http` (extensão REST Client no VS Code).

## Regras de negócio implementadas

1. ✅ Cadastro de **alunos** (nome, matrícula) e **equipamentos** (nome, patrimônio, status).
2. ✅ Empréstimo registra data de retirada e data limite.
3. ✅ **A API nunca** empresta equipamento com status ≠ `disponível` (retorna 400).
4. ✅ **O formulário** de empréstimo mostra apenas equipamentos disponíveis.
5. ✅ Devolução registra data e volta status para `disponível`.
6. ✅ **Histórico preservado** — empréstimo finalizado não é apagado (sem DELETE), garantindo rastreabilidade.
7. ✅ **Dashboard** com resumo e lista destacada de empréstimos **em atraso**.