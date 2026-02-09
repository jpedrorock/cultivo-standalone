# 🔐 Variáveis de Ambiente - App Cultivo

Este documento lista todas as variáveis de ambiente necessárias para rodar o App Cultivo.

## 📋 Variáveis Obrigatórias

### Banco de Dados

```env
DATABASE_URL="mysql://usuario:senha@host:porta/nome_banco"
```

**Exemplos:**
- Local: `mysql://root:senha123@localhost:3306/app_cultivo`
- Remoto: `mysql://user:pass@db.exemplo.com:3306/cultivo`

### Segurança

```env
JWT_SECRET="sua-chave-secreta-muito-segura-aqui-min-32-caracteres"
```

**Como gerar:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Autenticação OAuth

```env
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://login.manus.im"
VITE_APP_ID="seu-app-id-aqui"
```

### Proprietário

```env
OWNER_OPEN_ID="seu-id-aqui"
OWNER_NAME="Seu Nome"
```

### Configurações do App

```env
VITE_APP_TITLE="App Cultivo"
VITE_APP_LOGO="/logo.png"
```

## 🔧 Variáveis Opcionais

### APIs Manus (LLM, Storage, Notificações)

```env
BUILT_IN_FORGE_API_URL="https://forge.manus.im"
BUILT_IN_FORGE_API_KEY="sua-chave-backend"
VITE_FRONTEND_FORGE_API_KEY="sua-chave-frontend"
VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im"
```

### Analytics

```env
VITE_ANALYTICS_ENDPOINT="https://analytics.exemplo.com"
VITE_ANALYTICS_WEBSITE_ID="seu-website-id"
```

## 📝 Template .env

Crie um arquivo `.env` na raiz do projeto com este conteúdo:

```env
# Banco de Dados
DATABASE_URL="mysql://cultivo_user:senha@localhost:3306/app_cultivo"

# Segurança
JWT_SECRET="gere-uma-chave-aleatoria-segura-aqui"

# OAuth
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://login.manus.im"
VITE_APP_ID="seu-app-id"

# Proprietário
OWNER_OPEN_ID="seu-id"
OWNER_NAME="Seu Nome"

# App
VITE_APP_TITLE="App Cultivo"
VITE_APP_LOGO="/logo.png"
```

## 🚨 Funcionalidades que Dependem de Variáveis Opcionais

Se você **não** configurar as variáveis opcionais, as seguintes funcionalidades não funcionarão:

- **LLM/IA:** Chat com IA, geração de textos
- **Storage S3:** Upload de arquivos
- **Notificações:** Push notifications
- **Transcrição:** Áudio para texto
- **Geração de Imagens:** IA para criar imagens

**Todas as funcionalidades core do app funcionam sem essas variáveis!**
