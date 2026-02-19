# Guia de Deploy - App Cultivo

Este guia cobre o deploy do App Cultivo em diferentes plataformas de hospedagem.

## 📋 Visão Geral

O App Cultivo pode ser hospedado em:

1. **Manus** (Recomendado) - Hospedagem integrada com domínio customizado e SSL automático
2. **Vercel** - Plataforma serverless com deploy automático via Git
3. **Railway** - Plataforma com suporte a banco de dados gerenciado

## 🚀 Deploy no Manus (Recomendado)

O Manus oferece a melhor experiência de deploy com configuração zero e recursos integrados.

### Vantagens

✅ **Deploy com 1 clique** - Sem configuração manual  
✅ **Domínio customizado** - Compre ou conecte seu domínio  
✅ **SSL automático** - HTTPS configurado automaticamente  
✅ **Banco de dados gerenciado** - MySQL/TiDB incluído  
✅ **Storage S3 integrado** - Para upload de fotos  
✅ **OAuth pré-configurado** - Autenticação funcionando imediatamente  
✅ **Rollback fácil** - Volte para qualquer checkpoint anterior  

### Passo a Passo

#### 1. Criar Checkpoint

No Manus UI, após fazer suas alterações:

```bash
# Marcar tarefas como concluídas no todo.md
# Testar todas as funcionalidades
# Executar testes: pnpm test
```

Clique em "Save Checkpoint" e adicione uma descrição clara das mudanças.

#### 2. Publicar

1. Clique no botão **"Publish"** no header (canto superior direito)
2. Aguarde o deploy automático (2-3 minutos)
3. Seu app estará disponível em `https://seu-app.manus.space`

#### 3. Configurar Domínio Customizado (Opcional)

1. Acesse **Settings** → **Domains** no Management UI
2. Opções:
   - **Modificar prefixo**: Altere `seu-app` para outro nome
   - **Comprar domínio**: Adquira um domínio direto no Manus
   - **Conectar domínio existente**: Use um domínio que você já possui

**Para domínio existente:**

1. Adicione o domínio no Manus UI
2. Configure os registros DNS no seu provedor:
   ```
   Type: CNAME
   Name: @  (ou www)
   Value: seu-app.manus.space
   ```
3. Aguarde propagação DNS (até 48h, geralmente 1-2h)
4. SSL será configurado automaticamente

#### 4. Variáveis de Ambiente

Todas as variáveis necessárias são injetadas automaticamente pelo Manus:

- `DATABASE_URL` - Conexão com banco MySQL/TiDB
- `JWT_SECRET` - Chave para sessões
- `OAUTH_SERVER_URL` - URL do servidor OAuth
- `VITE_OAUTH_PORTAL_URL` - URL do portal de login
- `AWS_*` - Credenciais S3 para storage
- `BUILT_IN_FORGE_API_*` - APIs integradas (LLM, notificações)

Para adicionar variáveis customizadas:

1. Acesse **Settings** → **Secrets**
2. Clique em "Add Secret"
3. Insira nome e valor
4. Salve e faça novo deploy

#### 5. Monitoramento

Acesse o **Dashboard** no Management UI para ver:

- Status do servidor (running/stopped)
- Analytics (UV/PV)
- Logs em tempo real
- Uso de recursos

---

## 🔷 Deploy no Vercel

### Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Repositório Git (GitHub, GitLab ou Bitbucket)
- Banco de dados MySQL externo (PlanetScale, TiDB Cloud, etc.)

### Passo a Passo

#### 1. Preparar Repositório

```bash
# Certifique-se de que o código está no Git
git add .
git commit -m "Preparar para deploy"
git push origin main
```

#### 2. Importar Projeto no Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Conecte sua conta Git
3. Selecione o repositório `cultivo-architecture-docs`
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

#### 3. Configurar Variáveis de Ambiente

No painel do Vercel, vá em **Settings** → **Environment Variables** e adicione:

```env
# Banco de Dados (use PlanetScale ou TiDB Cloud)
DATABASE_URL=mysql://usuario:senha@host:3306/cultivo_db

# OAuth (você precisará configurar manualmente)
JWT_SECRET=sua_chave_secreta_aleatoria_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=seu_app_id

# S3 Storage (use AWS S3 ou Cloudflare R2)
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu-bucket

# Aplicação
VITE_APP_TITLE=App Cultivo
VITE_APP_LOGO=/logo.png
```

#### 4. Configurar Banco de Dados

**Opção 1: PlanetScale (Recomendado)**

1. Crie conta em [planetscale.com](https://planetscale.com)
2. Crie um novo banco de dados
3. Obtenha a connection string
4. Adicione ao Vercel como `DATABASE_URL`

**Opção 2: TiDB Cloud**

1. Crie conta em [tidbcloud.com](https://tidbcloud.com)
2. Crie um cluster (tier gratuito disponível)
3. Obtenha a connection string
4. Adicione ao Vercel como `DATABASE_URL`

#### 5. Deploy

1. Clique em **Deploy**
2. Aguarde o build (3-5 minutos)
3. Acesse o domínio gerado: `https://seu-app.vercel.app`

#### 6. Executar Migrações

```bash
# Localmente, com DATABASE_URL do Vercel
DATABASE_URL="mysql://..." pnpm db:push
```

#### 7. Domínio Customizado

1. No Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. SSL será configurado automaticamente

### Limitações no Vercel

⚠️ **Atenção**: O Vercel tem limitações para este tipo de aplicação:

- Funções serverless têm timeout de 10s (pode ser insuficiente)
- Não há suporte nativo para WebSockets
- Storage de arquivos é efêmero (use S3 obrigatoriamente)
- Banco de dados deve ser externo

---

## 🚂 Deploy no Railway

### Pré-requisitos

- Conta no [Railway](https://railway.app)
- Repositório Git

### Passo a Passo

#### 1. Criar Novo Projeto

1. Acesse [railway.app/new](https://railway.app/new)
2. Clique em "Deploy from GitHub repo"
3. Conecte sua conta GitHub
4. Selecione o repositório

#### 2. Adicionar Banco de Dados MySQL

1. No projeto Railway, clique em "+ New"
2. Selecione "Database" → "MySQL"
3. Aguarde provisionamento (1-2 minutos)
4. Copie a connection string gerada

#### 3. Configurar Variáveis de Ambiente

No Railway, vá em **Variables** e adicione:

```env
# Banco de Dados (gerado automaticamente pelo Railway)
DATABASE_URL=${{MySQL.DATABASE_URL}}

# OAuth
JWT_SECRET=sua_chave_secreta_aleatoria_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=seu_app_id

# S3 Storage
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=seu-bucket

# Aplicação
VITE_APP_TITLE=App Cultivo
VITE_APP_LOGO=/logo.png
PORT=3000
```

#### 4. Configurar Build

No Railway, vá em **Settings**:

- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `node dist/server/_core/index.js`
- **Watch Paths**: `/`

#### 5. Deploy

1. Clique em "Deploy"
2. Aguarde o build (3-5 minutos)
3. Acesse o domínio gerado: `https://seu-app.up.railway.app`

#### 6. Executar Migrações

```bash
# Localmente, com DATABASE_URL do Railway
DATABASE_URL="mysql://..." pnpm db:push
```

#### 7. Domínio Customizado

1. No Railway, vá em **Settings** → **Domains**
2. Clique em "Custom Domain"
3. Adicione seu domínio
4. Configure DNS conforme instruções

### Custos no Railway

- **Tier Gratuito**: $5 de crédito/mês
- **MySQL**: ~$5-10/mês
- **Aplicação**: ~$5-10/mês (baseado em uso)

---

## 🔒 Segurança

### Checklist de Segurança

- [ ] **HTTPS habilitado** (SSL/TLS)
- [ ] **Variáveis de ambiente protegidas** (não commitadas no Git)
- [ ] **JWT_SECRET forte** (mínimo 32 caracteres aleatórios)
- [ ] **Banco de dados com senha forte**
- [ ] **Backup automático do banco** configurado
- [ ] **CORS configurado** corretamente
- [ ] **Rate limiting** ativado (se disponível)

### Gerar JWT_SECRET Seguro

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## 📊 Monitoramento

### Logs

**Manus:**
- Acesse `.manus-logs/` no projeto
- `devserver.log` - Logs do servidor
- `browserConsole.log` - Logs do cliente
- `networkRequests.log` - Requisições HTTP

**Vercel:**
- Acesse **Deployments** → **Functions** → **Logs**

**Railway:**
- Acesse **Deployments** → **View Logs**

### Métricas

**Manus:**
- Dashboard integrado com UV/PV
- Status do servidor em tempo real

**Vercel:**
- Analytics integrado (pago)
- Vercel Speed Insights

**Railway:**
- Métricas de CPU/RAM/Rede
- Uptime monitoring

---

## 🔄 CI/CD

### Deploy Automático

**Manus:**
- Crie checkpoint → Clique em Publish

**Vercel:**
- Push para `main` → Deploy automático
- Pull Requests → Preview deploys

**Railway:**
- Push para `main` → Deploy automático
- Configurável por branch

### Rollback

**Manus:**
1. Acesse **Checkpoints** no Management UI
2. Selecione checkpoint anterior
3. Clique em "Rollback"

**Vercel:**
1. Acesse **Deployments**
2. Selecione deployment anterior
3. Clique em "Promote to Production"

**Railway:**
1. Acesse **Deployments**
2. Selecione deployment anterior
3. Clique em "Redeploy"

---

## ❓ Solução de Problemas

### Erro: "Cannot connect to database"

- Verifique `DATABASE_URL` nas variáveis de ambiente
- Teste conexão localmente: `mysql -h host -u user -p`
- Verifique se o banco permite conexões externas
- Verifique SSL/TLS requirements

### Erro: "OAuth redirect mismatch"

- Verifique se `VITE_OAUTH_PORTAL_URL` está correto
- Adicione domínio de produção nas configurações OAuth
- Use `window.location.origin` para redirects dinâmicos

### Erro: "Build failed"

- Verifique logs de build
- Teste build localmente: `pnpm build`
- Verifique se todas as dependências estão em `package.json`
- Limpe cache e tente novamente

### Site lento

- Ative CDN (Cloudflare, Vercel Edge)
- Otimize imagens (use WebP, compressão)
- Ative cache de assets estáticos
- Use lazy loading para componentes pesados

---

## 📚 Recursos Adicionais

- [Documentação Manus](https://docs.manus.im)
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Railway](https://docs.railway.app)
- [Guia de Instalação](./INSTALACAO.md)
- [Guia do Usuário](./GUIA-USUARIO.md)

---

**Desenvolvido com 🌱 para cultivadores**
