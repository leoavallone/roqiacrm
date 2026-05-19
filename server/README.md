# RoqIA CRM API

Backend em Express, TypeScript e MongoDB/Mongoose para o CRM.

## Configuracao

1. Copie `.env.example` para `.env`.
2. Preencha `MONGODB_URI` com a string da sua conta MongoDB.
3. Troque `JWT_SECRET` por um segredo forte.
4. Rode `npm run server:dev`.

Na primeira subida, o backend cria uma conta super admin inicial usando `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`.

Papeis internos:

- `superAdmin`: acessa todos os clientes, financeiro, usuarios, responsaveis, tarefas e chamados.
- `admin`: acessa clientes marcados como parceria, financeiro desses clientes, tarefas e chamados desse escopo.
- `collaborator`: acessa tarefas e chamados, sem carteira de clientes, financeiro, usuarios ou responsaveis.
- `client`: acessa apenas o portal do cliente vinculado.

Clientes possuem a flag `serviceMode`:

- `solo`: atendimento direto apenas pelo super admin.
- `partnership`: atendimento em parceria, visivel para admins.

Para apagar todos os usuarios e recriar apenas o super admin configurado no `.env`, rode:

```bash
npm run server:reset-users
```

## Scripts

- `npm run server:dev`: API em modo desenvolvimento.
- `npm run server:build`: compila o backend.
- `npm run server:start`: roda a build compilada.
- `npm run server:reset-users`: remove todos os usuarios e cria o super admin inicial.

## Endpoints principais

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
