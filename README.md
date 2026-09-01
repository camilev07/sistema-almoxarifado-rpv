📦 Almoxarifado Escolar — Sistema de Controle de Equipamentos
Sobre o projeto

O Sistema de Gestão de Almoxarifado é uma aplicação web criada para facilitar o controle dos equipamentos utilizados em um ambiente escolar.

A proposta é substituir o controle manual dos empréstimos por um sistema centralizado, no qual seja possível saber quem retirou determinado equipamento, quando ele foi retirado, qual é o prazo de devolução e quais itens estão disponíveis no momento.

Entre os materiais que podem ser administrados estão notebooks, multímetros e kits de robótica.

🧩 Como o sistema funciona

A aplicação é dividida em três partes principais:

                    ┌──────────────────────┐
                    │      Next.js         │
                    │      Frontend        │
                    │     :3000            │
                    └──────────┬───────────┘
                               │ JSON / HTTP
                               ▼
                    ┌──────────────────────┐
                    │       Express        │
                    │         API          │
                    │       :3001          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │       MySQL 8        │
                    │     almoxarifado     │
                    └──────────────────────┘


O frontend é responsável pela interface utilizada pelos funcionários do almoxarifado. O backend concentra as regras do sistema e disponibiliza os dados por meio de uma API REST. O MySQL armazena os alunos, equipamentos e registros de empréstimos.

Tecnologias utilizadas
Next.js — interface e navegação da aplicação.
Express.js — criação da API REST.
MySQL 8 — armazenamento dos dados.
mysql2 — comunicação entre a API e o banco.
CORS — comunicação entre frontend e backend.
Concurrently — execução dos dois servidores durante o desenvolvimento.
🗂️ Organização dos arquivos
almoxarifado/
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── db.js
│   │   └── routes/
│   ├── .env
│   ├── .env.example
│   └── routes.http
│
├── frontend/
│   └── src/
│       └── app/
│
└── docs/
    └── DER.md


Os scripts SQL ficam separados do código da aplicação. O backend possui as configurações da API e do banco, enquanto o frontend concentra as telas do sistema.

🖥️ Módulos da aplicação

A interface é organizada em diferentes áreas para facilitar o uso:

Dashboard

Apresenta uma visão geral do almoxarifado, incluindo informações importantes sobre os empréstimos e os itens que estão em atraso.

Alunos

Permite cadastrar e consultar os alunos que podem realizar empréstimos.

Os principais dados são:

Nome;
Matrícula.
Equipamentos

Centraliza o cadastro e o acompanhamento dos equipamentos.

Cada item possui:

Nome;
Número de patrimônio;
Status atual.
Empréstimos

É o módulo responsável pela retirada dos equipamentos.

O usuário seleciona o aluno, o equipamento e informa o prazo de devolução. Apenas equipamentos disponíveis podem ser selecionados.

Histórico

Exibe os empréstimos já realizados, incluindo aqueles que foram encerrados.

Os registros antigos permanecem armazenados para manter a rastreabilidade das movimentações.

🔐 Regras importantes

A aplicação possui validações tanto na interface quanto na API.

Um equipamento ocupado não pode ser emprestado.

Mesmo que alguém tente enviar diretamente uma requisição para a API, o backend verifica o status atual do equipamento antes de criar o empréstimo. Caso ele não esteja disponível, a operação é recusada com HTTP 400.

Durante um empréstimo, o equipamento deixa de aparecer entre os itens disponíveis. Quando ocorre a devolução, o sistema registra a data e libera novamente o equipamento.

O registro do empréstimo não é apagado após a devolução. Dessa forma, o sistema consegue manter o histórico completo das movimentações.

🔄 Fluxo de um empréstimo

O processo segue basicamente estas etapas:

Aluno seleciona o equipamento
            ↓
Sistema verifica disponibilidade
            ↓
Equipamento disponível?
       ↙             ↘
     NÃO              SIM
      ↓                ↓
   Retorna 400     Cria empréstimo
                       ↓
              Equipamento fica
                indisponível
                       ↓
                 Devolução
                       ↓
              Registra a data
                       ↓
              Libera equipamento


Essa validação impede que dois empréstimos sejam registrados para o mesmo equipamento enquanto ele estiver em uso.

🌐 Endpoints principais

A API disponibiliza endpoints para consultar equipamentos, controlar empréstimos e acompanhar atrasos.

Operação	Endpoint	Finalidade
Consultar	GET /api/equipamentos/disponiveis	Buscar equipamentos livres para retirada
Criar	POST /api/emprestimos	Registrar um novo empréstimo
Devolver	PUT /api/emprestimos/:id/devolucao	Finalizar um empréstimo
Consultar	GET /api/emprestimos/atrasados	Encontrar empréstimos fora do prazo
Consultar	GET /api/emprestimos/historico	Visualizar todas as movimentações

Para facilitar os testes, todas as rotas também estão descritas em backend/routes.http, que pode ser utilizado com o REST Client do VS Code.

🛠️ Configuração do ambiente
Requisitos

Para executar o projeto, é necessário possuir:

Node.js 18 ou superior;
MySQL 8 em execução;
Cliente mysql.
Banco de dados

Primeiro, configure as credenciais no arquivo .env:

cd backend
cp .env.example .env


Depois, crie as tabelas e insira os dados iniciais:

mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql

API
cd backend
npm install
npm run dev


A API será executada em:

http://localhost:3001


O endpoint abaixo pode ser utilizado para verificar o funcionamento:

GET /api/health


Resposta:

{
  "status": "ok"
}

Interface

Em outro terminal:

cd frontend
npm install
npm run dev


Depois, acesse:

http://localhost:3000


A API utilizada pelo frontend pode ser alterada através da variável:

NEXT_PUBLIC_API_BASE


Caso nenhuma configuração seja informada, será utilizado:

http://localhost:3001/api

🚀 Ambiente de desenvolvimento completo

Também é possível iniciar o frontend e a API com um único comando.

Na raiz:

npm install
npm run install:all
npm run dev:all


O concurrently mantém os dois processos rodando ao mesmo tempo:

[API]       http://localhost:3001
[FRONTEND]  http://localhost:3000


Caso um dos serviços seja encerrado, a opção -k também encerra o processo restante.

📌 Resultado esperado

Ao final, o sistema oferece um fluxo completo para gerenciamento do almoxarifado:

Cadastro de alunos
        ↓
Cadastro de equipamentos
        ↓
Controle de disponibilidade
        ↓
Registro de empréstimos
        ↓
Acompanhamento dos prazos
        ↓
Registro de devoluções
        ↓
Histórico das movimentações


A solução foi estruturada para manter o controle dos equipamentos de forma simples, evitar empréstimos indevidos e preservar todas as informações necessárias para consultar o histórico do almoxarifado.
