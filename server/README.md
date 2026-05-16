# RoqIA CRM API

Backend em Express, TypeScript e MongoDB/Mongoose para o CRM.

## Configuracao

1. Copie `.env.example` para `.env`.
2. Preencha `MONGODB_URI` com a string da sua conta MongoDB.
3. Troque `JWT_SECRET` por um segredo forte.
4. Rode `npm run server:dev`.

Na primeira subida, o backend cria uma conta admin inicial usando `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`.

## Scripts

- `npm run server:dev`: API em modo desenvolvimento.
- `npm run server:build`: compila o backend.
- `npm run server:start`: roda a build compilada.

## Endpoints principais

- `POST /api/auth/register`: cria usuario cliente comum, sem permissao admin.
- `POST /api/auth/login`: autentica e retorna token JWT.
- `GET /api/auth/me`: retorna usuario logado.
- `GET|POST|PATCH|DELETE /api/users`: gestao de usuarios, apenas admin.
- `GET|POST|PATCH|DELETE /api/customers`: gestao de clientes, apenas admin.
- `GET|POST|PATCH|DELETE /api/team`: gestao de responsaveis, apenas admin.
- `GET|POST|PATCH|DELETE /api/tickets`: chamados. Clientes criam chamados vinculados ao proprio cliente; admin gerencia fila, responsavel e status.
- `GET|POST|PATCH|DELETE /api/tasks`: tarefas internas, apenas admin.
- `GET /api/finance/summary`: indicadores financeiros, apenas admin.

Envie o token no header:

```http
Authorization: Bearer seu_token
```
