# RoqIA CRM

Aplicacao completa em um unico pacote Node:

- React/Vite no frontend
- Express no backend
- MongoDB para persistencia
- o backend serve o frontend e a API no mesmo dominio

## Deploy no EasyPanel sem Dockerfile

Crie um app pelo Git usando buildpack/Nixpacks. O arquivo `nixpacks.toml` ja define:

```bash
npm ci
npm run build
npm start
```

Configure as variaveis de ambiente no EasyPanel:

```env
PORT=3000
MONGODB_URI=sua_string_mongodb
JWT_SECRET=uma_chave_grande_e_secreta_com_16_ou_mais_caracteres
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://crm.roqia.com.br
SEED_ADMIN_NAME=Super Admin RoqIA
SEED_ADMIN_EMAIL=roqiaaccelerate@gmail.com
SEED_ADMIN_PASSWORD=troque-essa-senha
```

Depois do deploy, o dominio deve apontar para esse app Node. Valide:

```bash
curl https://crm.roqia.com.br/health
```

O retorno esperado e:

```json
{"status":"ok"}
```

Quando isso estiver certo, o login em `https://crm.roqia.com.br/dist/app.html` e `/app.html` usa a API do mesmo dominio em `/api/auth/login`.

## Desenvolvimento local

Instale dependencias:

```bash
npm install
```

Suba o MongoDB local, se quiser usar o `docker-compose.yml` apenas para desenvolvimento:

```bash
npm run db:up
```

Rode frontend e backend em terminais separados:

```bash
npm run server:dev
npm run dev
```

Build completo:

```bash
npm run build
```
