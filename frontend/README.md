# Financy Frontend

Aplicação web para autenticação e gerenciamento de categorias e transações financeiras. O frontend foi desenvolvido com React, TypeScript, GraphQL e Vite.

## Executar

```bash
cp .env.example .env
pnpm install
pnpm dev
```

A aplicação fica disponível em `http://localhost:5173`.

O arquivo `.env.example` configura a API GraphQL em `http://localhost:4001/graphql`. Para utilizar outra URL, altere a variável `VITE_BACKEND_URL` no arquivo `.env`:

```env
VITE_BACKEND_URL=http://localhost:4001/graphql
```

## Comandos principais

- `pnpm dev`: inicia o servidor de desenvolvimento
- `pnpm build`: verifica os tipos e gera a versão de produção
- `pnpm lint`: executa o ESLint
- `pnpm preview`: serve a versão de produção localmente

## Funcionalidades

- criação de conta e login
- dashboard financeiro
- listagem, criação, edição e exclusão de transações
- listagem, criação, edição e exclusão de categorias
- gerenciamento da conta autenticada

As consultas GraphQL enviam automaticamente o token de autenticação no header `Authorization: Bearer <token>`.
