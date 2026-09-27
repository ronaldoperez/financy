# Financy Backend

API GraphQL para autenticação, categorias e transações financeiras. Cada operação protegida usa o usuário do token Bearer e só acessa os próprios registros.

## Executar

```bash
cp .env.example .env
pnpm install
pnpm generate
pnpm migrate
pnpm dev
```

A API fica disponível em `http://localhost:4001/graphql`.

Para carregar dados de demonstração, execute `pnpm seed` após a migração. O usuário criado é `demo@financy.com` com senha `financy123`.

## Operações principais

- `register` e `login`
- `listCategories`, `createCategory`, `updateCategory`, `deleteCategory`
- `listTransactions`, `createTransaction`, `updateTransaction`, `deleteTransaction`

As operações de categorias e transações exigem `Authorization: Bearer <token>`.
