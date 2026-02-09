# 📦 Guia de Deploy - App Cultivo

**Autor:** Manus AI  
**Data:** Fevereiro 2026  
**Versão:** 2.2.0

---

## 🎯 Visão Geral

Este guia fornece instruções completas para fazer deploy do **App Cultivo** em diferentes ambientes. O projeto é 100% portável e **não perde nenhuma funcionalidade** ao sair do Manus - todo o código é seu e pode ser hospedado em qualquer servidor.

### Tecnologias Utilizadas

O App Cultivo é construído com as seguintes tecnologias:

- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **Backend:** Node.js + Express 4 + tRPC 11
- **Banco de Dados:** MySQL/TiDB (compatível com qualquer MySQL 5.7+)
- **ORM:** Drizzle ORM
- **Autenticação:** OAuth 2.0 (Manus OAuth - pode ser substituído)

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 22.x ou superior
- **pnpm** 9.x ou superior (gerenciador de pacotes)
- **MySQL** 5.7+ ou **MariaDB** 10.3+ (ou acesso a um banco MySQL remoto)
- **Git** (para clonar o repositório)

---

## 🚀 Opção 1: Deploy em Servidor (VPS, Cloud)

### Passo 1: Preparar o Servidor

Conecte-se ao seu servidor via SSH e instale as dependências necessárias:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm mysql-server nginx

# Instalar pnpm globalmente
npm install -g pnpm

# Verificar instalações
node --version  # Deve ser 22.x+
pnpm --version  # Deve ser 9.x+
mysql --version # Deve ser 5.7+
```

### Passo 2: Configurar o Banco de Dados MySQL

Crie um banco de dados e usuário para o App Cultivo:

```bash
# Acessar MySQL
sudo mysql -u root -p

# Dentro do MySQL, execute:
CREATE DATABASE app_cultivo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cultivo_user'@'localhost' IDENTIFIED BY 'SuaSenhaSegura123!';
GRANT ALL PRIVILEGES ON app_cultivo.* TO 'cultivo_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Passo 3: Fazer Upload do Projeto

Transfira o arquivo ZIP do projeto para o servidor:

```bash
# No seu computador local
scp app-cultivo.zip usuario@seu-servidor.com:/home/usuario/

# No servidor
cd /home/usuario
unzip app-cultivo.zip
cd cultivo-architecture-docs
```

### Passo 4: Configurar Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
nano .env
```

Preencha as variáveis obrigatórias (veja seção "Variáveis de Ambiente" abaixo).

### Passo 5: Instalar Dependências e Migrar Banco

```bash
# Instalar dependências
pnpm install

# Gerar migrações e aplicar ao banco
pnpm db:push

# Build do projeto para produção
pnpm build
```

### Passo 6: Configurar PM2 (Process Manager)

Instale o PM2 para manter o app rodando em background:

```bash
# Instalar PM2
npm install -g pm2

# Iniciar o app
pm2 start dist/index.js --name app-cultivo

# Configurar para iniciar automaticamente no boot
pm2 startup
pm2 save
```

### Passo 7: Configurar Nginx como Reverse Proxy

Crie um arquivo de configuração do Nginx:

```bash
sudo nano /etc/nginx/sites-available/app-cultivo
```

Cole a seguinte configuração:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ative o site e reinicie o Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/app-cultivo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Passo 8: Configurar SSL com Let's Encrypt (Opcional mas Recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com

# Renovação automática já está configurada
```

---

## 💻 Opção 2: Instalação Local (Desenvolvimento)

### Windows

1. **Instalar Node.js:**
   - Baixe o instalador em [nodejs.org](https://nodejs.org)
   - Execute o instalador e siga as instruções
   - Abra o PowerShell e instale o pnpm:
     ```powershell
     npm install -g pnpm
     ```

2. **Instalar MySQL:**
   - Baixe o MySQL Community Server em [mysql.com/downloads](https://dev.mysql.com/downloads/mysql/)
   - Execute o instalador e configure a senha root
   - Crie o banco de dados usando MySQL Workbench ou linha de comando

3. **Configurar o Projeto:**
   ```powershell
   # Extrair o ZIP do projeto
   # Navegar até a pasta
   cd caminho\para\cultivo-architecture-docs
   
   # Copiar .env.example para .env
   copy .env.example .env
   
   # Editar .env com Notepad
   notepad .env
   
   # Instalar dependências
   pnpm install
   
   # Aplicar migrações
   pnpm db:push
   
   # Iniciar em modo desenvolvimento
   pnpm dev
   ```

4. **Acessar o App:**
   - Abra o navegador em `http://localhost:3000`

### macOS

1. **Instalar Homebrew (se não tiver):**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Instalar Node.js e MySQL:**
   ```bash
   brew install node@22
   brew install mysql
   npm install -g pnpm
   
   # Iniciar MySQL
   brew services start mysql
   
   # Configurar senha root
   mysql_secure_installation
   ```

3. **Configurar o Projeto:**
   ```bash
   # Extrair o ZIP e navegar
   cd ~/Downloads/cultivo-architecture-docs
   
   # Copiar .env.example
   cp .env.example .env
   
   # Editar .env
   nano .env
   
   # Instalar e rodar
   pnpm install
   pnpm db:push
   pnpm dev
   ```

### Linux (Ubuntu/Debian)

1. **Instalar Node.js e MySQL:**
   ```bash
   # Adicionar repositório NodeSource
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   
   # Instalar pacotes
   sudo apt update
   sudo apt install -y nodejs mysql-server
   
   # Instalar pnpm
   npm install -g pnpm
   
   # Configurar MySQL
   sudo mysql_secure_installation
   ```

2. **Configurar o Projeto:**
   ```bash
   cd ~/cultivo-architecture-docs
   cp .env.example .env
   nano .env
   pnpm install
   pnpm db:push
   pnpm dev
   ```

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

### Obrigatórias

```env
# Banco de Dados MySQL
DATABASE_URL="mysql://usuario:senha@localhost:3306/app_cultivo"

# JWT Secret (gere uma string aleatória segura)
JWT_SECRET="sua-chave-secreta-muito-segura-aqui-min-32-caracteres"

# OAuth (Manus - pode ser substituído por Google/GitHub OAuth)
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://login.manus.im"
VITE_APP_ID="seu-app-id-aqui"

# Informações do Proprietário
OWNER_OPEN_ID="seu-id-aqui"
OWNER_NAME="Seu Nome"

# Título e Logo do App
VITE_APP_TITLE="App Cultivo"
VITE_APP_LOGO="/logo.png"
```

### Opcionais (Funcionalidades Avançadas)

```env
# APIs Manus (LLM, Storage, Notificações)
# Se não configurar, funcionalidades de IA e notificações não funcionarão
BUILT_IN_FORGE_API_URL="https://forge.manus.im"
BUILT_IN_FORGE_API_KEY="sua-chave-api-aqui"
VITE_FRONTEND_FORGE_API_KEY="sua-chave-frontend-aqui"
VITE_FRONTEND_FORGE_API_URL="https://forge.manus.im"

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT="https://analytics.exemplo.com"
VITE_ANALYTICS_WEBSITE_ID="seu-website-id"
```

### Como Gerar JWT_SECRET Seguro

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## 🔄 Substituindo OAuth do Manus

Se você quiser usar outro provedor de OAuth (Google, GitHub, Auth0), siga estes passos:

### 1. Remover Dependência do Manus OAuth

Edite `server/_core/oauth.ts` e substitua a lógica de autenticação pela do seu provedor escolhido.

### 2. Exemplo com Google OAuth

```typescript
// Instalar passport e estratégia do Google
// pnpm add passport passport-google-oauth20

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    // Lógica para criar/atualizar usuário no banco
    return cb(null, profile);
  }
));
```

### 3. Atualizar .env

```env
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
```

---

## 🗄️ Backup e Restauração do Banco de Dados

### Fazer Backup

```bash
# Backup completo
mysqldump -u cultivo_user -p app_cultivo > backup_$(date +%Y%m%d).sql

# Backup apenas dados (sem estrutura)
mysqldump -u cultivo_user -p --no-create-info app_cultivo > dados_backup.sql
```

### Restaurar Backup

```bash
mysql -u cultivo_user -p app_cultivo < backup_20260209.sql
```

### Exportar Dados via Interface

O App Cultivo possui um botão "Exportar CSV" na página de Histórico que permite baixar todos os registros em formato CSV.

---

## 🐳 Deploy com Docker (Opcional)

Se preferir usar Docker, crie um `Dockerfile` na raiz do projeto:

```dockerfile
FROM node:22-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build do projeto
RUN pnpm build

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "dist/index.js"]
```

E um `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://cultivo_user:senha@db:3306/app_cultivo
      - JWT_SECRET=sua-chave-secreta-aqui
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=app_cultivo
      - MYSQL_USER=cultivo_user
      - MYSQL_PASSWORD=senha
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

Rodar com Docker:

```bash
docker-compose up -d
```

---

## 🚨 Funcionalidades que Dependem do Manus

As seguintes funcionalidades **não funcionarão** fora do Manus sem configuração adicional:

### 1. **Autenticação OAuth**
- **Solução:** Substituir por Google OAuth, GitHub OAuth, ou Auth0 (veja seção acima)

### 2. **Notificações Push**
- **Dependência:** `BUILT_IN_FORGE_API_KEY` e `BUILT_IN_FORGE_API_URL`
- **Solução:** Integrar com Firebase Cloud Messaging, OneSignal, ou Pusher

### 3. **Upload de Arquivos (S3)**
- **Dependência:** APIs do Manus para storage
- **Solução:** Configurar AWS S3, Cloudflare R2, ou MinIO próprio
- **Arquivo a modificar:** `server/storage.ts`

### 4. **Integração com LLM (Chat IA)**
- **Dependência:** `BUILT_IN_FORGE_API_KEY`
- **Solução:** Integrar diretamente com OpenAI API, Anthropic Claude, ou Ollama local
- **Arquivo a modificar:** `server/_core/llm.ts`

### 5. **Transcrição de Áudio**
- **Dependência:** API Whisper do Manus
- **Solução:** Usar OpenAI Whisper API diretamente ou Whisper local
- **Arquivo a modificar:** `server/_core/voiceTranscription.ts`

### 6. **Geração de Imagens**
- **Dependência:** ImageService do Manus
- **Solução:** Integrar com DALL-E, Stable Diffusion, ou Midjourney API
- **Arquivo a modificar:** `server/_core/imageGeneration.ts`

**Importante:** Todas as funcionalidades **core** do app (gerenciamento de estufas, ciclos, registros, calculadoras, gráficos, alertas) funcionam 100% sem dependência do Manus!

---

## 📊 Monitoramento e Logs

### Ver Logs do PM2

```bash
# Logs em tempo real
pm2 logs app-cultivo

# Últimas 100 linhas
pm2 logs app-cultivo --lines 100

# Logs de erro apenas
pm2 logs app-cultivo --err
```

### Monitorar Performance

```bash
# Dashboard do PM2
pm2 monit

# Status dos processos
pm2 status

# Informações detalhadas
pm2 info app-cultivo
```

---

## 🔧 Troubleshooting

### Erro: "Cannot connect to database"

**Solução:**
1. Verifique se o MySQL está rodando: `sudo systemctl status mysql`
2. Teste a conexão: `mysql -u cultivo_user -p app_cultivo`
3. Verifique a `DATABASE_URL` no `.env`

### Erro: "Port 3000 already in use"

**Solução:**
```bash
# Encontrar processo usando a porta
lsof -i :3000

# Matar o processo
kill -9 <PID>

# Ou mudar a porta no código (server/_core/index.ts)
```

### Erro: "pnpm: command not found"

**Solução:**
```bash
npm install -g pnpm
```

### Migrações não aplicam

**Solução:**
```bash
# Forçar regeneração das migrações
rm -rf drizzle/migrations/*
pnpm db:push
```

---

## 📞 Suporte

Para dúvidas ou problemas:

1. **Documentação do Projeto:** Leia o `README.md` na raiz do projeto
2. **Logs do Servidor:** Verifique os logs com `pm2 logs` ou `pnpm dev`
3. **Comunidade:** Consulte a documentação das tecnologias utilizadas:
   - [React](https://react.dev)
   - [tRPC](https://trpc.io)
   - [Drizzle ORM](https://orm.drizzle.team)
   - [Tailwind CSS](https://tailwindcss.com)

---

## ✅ Checklist de Deploy

Antes de colocar em produção, verifique:

- [ ] Banco de dados MySQL configurado e acessível
- [ ] Arquivo `.env` preenchido com todas as variáveis obrigatórias
- [ ] `JWT_SECRET` gerado com pelo menos 32 caracteres aleatórios
- [ ] Migrações aplicadas com `pnpm db:push`
- [ ] Build de produção gerado com `pnpm build`
- [ ] PM2 configurado para reiniciar automaticamente
- [ ] Nginx configurado como reverse proxy
- [ ] SSL/HTTPS configurado (Let's Encrypt)
- [ ] Firewall configurado (portas 80, 443, 3306 se necessário)
- [ ] Backup automático do banco configurado
- [ ] Logs sendo monitorados

---

**Boa sorte com o deploy! 🚀**
