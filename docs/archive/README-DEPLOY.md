# 🚀 App Cultivo - Pacote de Deploy

**Versão:** 2.2.0  
**Data:** Fevereiro 2026

---

## 📦 Conteúdo do Pacote

Este pacote contém todo o código-fonte do **App Cultivo**, pronto para ser instalado em qualquer servidor ou computador local.

### Arquivos Importantes

- **DEPLOY_GUIDE.md** - Guia completo de deploy (VPS, Docker, Local)
- **ENV_VARS.md** - Documentação de variáveis de ambiente
- **package.json** - Dependências do projeto
- **drizzle/** - Migrações do banco de dados
- **client/** - Código frontend (React + Vite)
- **server/** - Código backend (Express + tRPC)

---

## ⚡ Quick Start

### 1. Instalar Dependências

```bash
# Certifique-se de ter Node.js 22+ e pnpm instalados
node --version  # Deve ser 22.x+
pnpm --version  # Deve ser 9.x+

# Instalar dependências do projeto
pnpm install
```

### 2. Configurar Banco de Dados MySQL

```bash
# Criar banco de dados
mysql -u root -p

# Dentro do MySQL:
CREATE DATABASE app_cultivo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cultivo_user'@'localhost' IDENTIFIED BY 'SuaSenhaSegura123!';
GRANT ALL PRIVILEGES ON app_cultivo.* TO 'cultivo_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Criar Arquivo .env

Crie um arquivo `.env` na raiz do projeto com este conteúdo mínimo:

```env
DATABASE_URL="mysql://cultivo_user:SuaSenhaSegura123!@localhost:3306/app_cultivo"
JWT_SECRET="gere-uma-chave-aleatoria-de-32-caracteres-aqui"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://login.manus.im"
VITE_APP_ID="seu-app-id-manus"
OWNER_OPEN_ID="seu-id"
OWNER_NAME="Seu Nome"
VITE_APP_TITLE="App Cultivo"
VITE_APP_LOGO="/logo.png"
```

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Aplicar Migrações

```bash
pnpm db:push
```

### 5. Rodar em Desenvolvimento

```bash
pnpm dev
```

Acesse: `http://localhost:3000`

### 6. Build para Produção

```bash
# Gerar build
pnpm build

# Rodar em produção
node dist/index.js
```

---

## 📚 Documentação Completa

Para instruções detalhadas de deploy em diferentes ambientes, consulte:

- **DEPLOY_GUIDE.md** - Guia completo (VPS, Docker, Nginx, SSL, PM2)
- **ENV_VARS.md** - Todas as variáveis de ambiente disponíveis

---

## ✅ Funcionalidades 100% Portáveis

Estas funcionalidades funcionam **sem dependência do Manus**:

- ✅ Gerenciamento de Estufas
- ✅ Ciclos de Cultivo
- ✅ Registros Diários (Temp, RH, PPFD, pH, EC)
- ✅ Calculadoras (VPD, DLI, Fertilização, Conversões)
- ✅ Gráficos de Análise (com zoom e panorâmica)
- ✅ Alertas e Tarefas
- ✅ Gerenciamento de Strains
- ✅ Exportação CSV
- ✅ PWA (instalação no celular)
- ✅ Dark Mode

---

## 🔧 Funcionalidades que Precisam de Configuração Extra

Estas funcionalidades requerem APIs externas (podem ser substituídas):

- 🔐 **Autenticação OAuth** - Substituir por Google/GitHub OAuth
- 📧 **Notificações Push** - Integrar Firebase/OneSignal
- 🤖 **Chat IA** - Integrar OpenAI API
- 🎙️ **Transcrição de Áudio** - Integrar Whisper API
- 🖼️ **Geração de Imagens** - Integrar DALL-E/Stable Diffusion
- ☁️ **Upload de Arquivos** - Configurar AWS S3 próprio

**Veja DEPLOY_GUIDE.md seção "Substituindo OAuth do Manus" para detalhes.**

---

## 🆘 Suporte

### Problemas Comuns

**Erro: "Cannot connect to database"**
- Verifique se o MySQL está rodando
- Teste a conexão: `mysql -u cultivo_user -p app_cultivo`
- Verifique a `DATABASE_URL` no `.env`

**Erro: "Port 3000 already in use"**
```bash
lsof -i :3000
kill -9 <PID>
```

**Erro: "pnpm: command not found"**
```bash
npm install -g pnpm
```

### Mais Ajuda

Consulte o **DEPLOY_GUIDE.md** seção "Troubleshooting" para mais soluções.

---

## 📄 Licença

Este projeto é de propriedade do usuário. Todos os direitos reservados.

---

**Desenvolvido com ❤️ usando React, tRPC, e Drizzle ORM**
