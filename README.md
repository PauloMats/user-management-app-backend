 Conectar Backend - Gerenciamento de Usuários

Este é o backend da aplicação Conectar, desenvolvido com NestJS e TypeScript. Ele é responsável pelo gerenciamento de usuários, autenticação (incluindo JWT), autorização baseada em papéis e fornece uma API RESTful para o frontend. Utiliza Prisma como ORM e PostgreSQL como banco de dados.

## Funcionalidades Principais

* **Autenticação:**
    * Registro de novos usuários (`/auth/register`).
    * Login de usuários existentes com email e senha (`/auth/login`).
    * Geração de JSON Web Tokens (JWT) para sessões seguras.
* **Gerenciamento de Usuários (CRUD):**
    * Criação de usuários (geralmente via registro, ou por admin).
    * Leitura de informações de usuários (lista para admins, perfil para usuários).
    * Atualização de informações de usuários (admins podem mais, usuários atualizam próprio perfil).
    * Exclusão de usuários (apenas admins).
* **Autorização:**
    * Sistema de papéis (`ADMIN`, `USER`).
    * Guards para proteger rotas baseadas no papel do usuário.
* **Filtros e Ordenação:**
    * Admins podem listar usuários filtrando por papel e ordenando por nome ou data de criação.
* **Notificações (Usuários Inativos):**
    * Endpoint para listar usuários que não realizam login há mais de 30 dias (acessível por admins).
* **Documentação da API:**
    * Gerada automaticamente com Swagger (OpenAPI) e acessível em `/api-docs`.

## Tecnologias Utilizadas

* **Framework:** NestJS (Node.js)
* **Linguagem:** TypeScript
* **Banco de Dados:** PostgreSQL
* **ORM:** Prisma
* **Autenticação:** `jsonwebtoken`, `bcrypt`, `@nestjs/passport`, `passport-jwt`, `passport-local`
* **Validação:** `class-validator`, `class-transformer`
* **Documentação:** `@nestjs/swagger`

## Estrutura do Projeto

```
prisma/
├── schema.prisma             # Definição do schema do banco de dados para o Prisma
└── migrations/               # Migrações do banco de dados geradas pelo Prisma
src/
├── app.module.ts             # Módulo raiz da aplicação
├── main.ts                   # Ponto de entrada da aplicação (bootstrap)
│
├── auth/                     # Módulo de Autenticação
│   ├── dto/
│   ├── strategies/
│   ├── guards/
│   ├── decorators/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   └── auth.service.ts
│
├── users/                    # Módulo de Usuários
│   ├── dto/
│   ├── users.module.ts
│   ├── users.controller.ts
│   └── users.service.ts
│
└── prisma/                   # Módulo e serviço do Prisma
    ├── prisma.module.ts
    └── prisma.service.ts

.env                          # Variáveis de ambiente (NÃO versionar)
.env.example                  # Exemplo de variáveis de ambiente
tsconfig.json                 # Configuração do TypeScript
...
```

## Pré-requisitos

* Node.js (v16 ou superior recomendado)
* npm (v8+) ou yarn (v1.22+)
* PostgreSQL (v12+) instalado e rodando
* Git

## Configuração do Ambiente (`.env`)

1.  Na raiz do projeto backend, crie um arquivo chamado `.env`.
2.  Adicione a string de conexão para o seu banco PostgreSQL e outras configurações:

    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public"
    # Exemplo: DATABASE_URL="postgresql://postgres:admin@localhost:5432/conectar_db_prisma?schema=public"

    PORT=3001
    JWT_SECRET=sua_chave_secreta_super_longa_e_segura_aqui
    JWT_EXPIRATION_TIME=3600s
    ```
    Substitua `USER`, `PASSWORD`, `HOST`, `PORT`, e `DATABASE_NAME` pelos seus valores.

## Instalação das Dependências

```bash
# Usando npm
npm install

# Ou usando yarn
yarn install
```

## Configuração do Banco de Dados e Migrations (Prisma)

1.  **Certifique-se** de que seu servidor PostgreSQL está rodando e que você criou o banco de dados especificado em `DATABASE_NAME` na sua `DATABASE_URL`.
2.  **Certifique-se** de que o usuário do banco de dados especificado na `DATABASE_URL` tem permissão para criar bancos de dados no servidor PostgreSQL (permissão `CREATEDB`). Isso é necessário para o "shadow database" do Prisma durante o desenvolvimento.
    ```sql
    -- No psql, como superusuário:
    ALTER USER seu_usuario_db CREATEDB;
    ```
3.  **Defina o Schema do Banco de Dados**:
    Edite o arquivo `prisma/schema.prisma` para definir seus modelos de dados (ex: `User`, `UserRole`).
4.  **Aplique as Migrations e Gere o Prisma Client**:
    Este comando irá criar as tabelas no seu banco de dados com base no `schema.prisma` e gerar o Prisma Client.
    ```bash
    npx prisma migrate dev --name nome_descritivo_da_migracao
    ```
    (Ex: `npx prisma migrate dev --name initial_setup`)

    Se você fizer alterações no `prisma/schema.prisma` no futuro, rode `npx prisma migrate dev --name nome_da_nova_alteracao` novamente.
    Pode ser necessário rodar `npx prisma generate` manualmente após algumas alterações ou se o client não estiver atualizado.

## Rodando a Aplicação

* **Modo de Desenvolvimento (com hot-reload):**
    ```bash
    # npm
    npm run start:dev

    # yarn
    yarn start:dev
    ```
A aplicação estará disponível em `http://localhost:PORT` (o `PORT` definido no seu `.env` ou 3001 por padrão).

## Documentação da API (Swagger)

Após iniciar a aplicação, a documentação da API gerada pelo Swagger estará disponível em:
`http://localhost:PORT/api-docs`

## Testes (A Serem Implementados)

* **Rodar testes unitários:**
    ```bash
    # npm
    npm run test
    ```
* **Rodar testes de integração (e2e):**
    ```bash
    # npm
    npm run test:e2e
    ```