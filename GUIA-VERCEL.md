# 🌐 Guia de Configuração - Vercel (Hospedagem do Site)

## O que é Vercel?

Vercel é uma plataforma de hospedagem gratuita com:
- ✅ Deploy automático do GitHub
- ✅ SSL gratuito (HTTPS)
- ✅ Domínio customizado grátis
- ✅ Builds automáticos a cada commit
- ✅ Sem limite de projetos pessoais

---

## Passo 1: Preparar o Projeto no GitHub

### Se ainda não tem o projeto no GitHub:

1. Acesse: https://github.com/new
2. Crie um repositório:
   - **Name:** `app-cultivo` (ou o nome que preferir)
   - **Visibility:** Private (recomendado)
3. Clique em **"Create repository"**

4. No terminal, dentro da pasta do projeto:

```bash
# Inicializar Git (se ainda não fez)
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "Initial commit"

# Adicionar o repositório remoto (substitua SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/app-cultivo.git

# Enviar para o GitHub
git push -u origin main
```

---

## Passo 2: Criar Conta no Vercel

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"** (mais fácil)
4. Autorize o Vercel no GitHub

---

## Passo 3: Importar Projeto do GitHub

1. No dashboard do Vercel, clique em **"Add New..."** → **"Project"**
2. Encontre seu repositório `app-cultivo` na lista
3. Clique em **"Import"**

---

## Passo 4: Configurar Build Settings

Na tela de configuração:

### Framework Preset
- Selecione: **"Vite"** (já deve estar detectado automaticamente)

### Root Directory
- Deixe em **"./"** (raiz do projeto)

### Build Command
- Deve estar: `npm run build`
- ✅ Deixe como está

### Output Directory
- Deve estar: `dist`
- ✅ Deixe como está

### Install Command
- Deve estar: `npm install`
- ⚠️ **MUDE PARA:** `npm install --legacy-peer-deps`

---

## Passo 5: Configurar Variáveis de Ambiente

⚠️ **IMPORTANTE:** Não clique em "Deploy" ainda!

1. Clique em **"Environment Variables"** (expanda a seção)

2. Adicione as seguintes variáveis:

| Name | Value | Onde pegar |
|------|-------|------------|
| `DATABASE_URL` | `mysql://xxx...` | Connection string do PlanetScale (Passo 3 do guia anterior) |
| `NODE_ENV` | `production` | Digite manualmente |
| `PORT` | `3000` | Digite manualmente |

### Variáveis Opcionais (deixe em branco por enquanto):

| Name | Value |
|------|-------|
| `VITE_ANALYTICS_ENDPOINT` | *(vazio)* |
| `VITE_ANALYTICS_WEBSITE_ID` | *(vazio)* |
| `OAUTH_SERVER_URL` | *(vazio)* |
| `VITE_OAUTH_PORTAL_URL` | *(vazio)* |

3. Clique em **"Add"** para cada variável

---

## Passo 6: Deploy Inicial

1. Depois de adicionar todas as variáveis, clique em **"Deploy"**
2. Aguarde 2-5 minutos enquanto o Vercel:
   - Instala dependências
   - Compila o projeto
   - Faz deploy

3. Quando aparecer **"🎉 Congratulations!"**, clique em **"Visit"**

---

## Passo 7: Testar o Site

Você verá uma URL tipo: `https://app-cultivo-xyz123.vercel.app`

1. Acesse a URL
2. Verifique se o site carrega
3. Teste criar uma estufa

⚠️ **Se der erro de banco de dados:**
- Volte no Vercel → Settings → Environment Variables
- Verifique se a `DATABASE_URL` está correta
- Clique em **"Redeploy"** no topo da página

---

## Passo 8: Configurar Domínio Customizado

### Se você tem um domínio próprio (ex: `seudominio.com.br`):

1. No projeto do Vercel, clique em **"Settings"** → **"Domains"**

2. Digite seu domínio ou subdomínio:
   - **Domínio completo:** `cultivo.seudominio.com.br`
   - **Ou raiz:** `seudominio.com.br`

3. Clique em **"Add"**

4. O Vercel vai mostrar os registros DNS que você precisa adicionar:

```
Type: CNAME
Name: cultivo (ou @)
Value: cname.vercel-dns.com
```

5. **Configurar no seu provedor de domínio:**

#### Se seu domínio está no Registro.br:

1. Acesse: https://registro.br
2. Login → Meus Domínios
3. Clique no domínio → **"Editar Zona"**
4. Adicione o registro CNAME:
   - **Nome:** `cultivo` (ou deixe vazio se for raiz)
   - **Tipo:** `CNAME`
   - **Dados:** `cname.vercel-dns.com`
5. Salve

#### Se seu domínio está na GoDaddy:

1. Acesse: https://godaddy.com
2. Meus Produtos → DNS
3. Adicione registro:
   - **Type:** CNAME
   - **Name:** `cultivo`
   - **Value:** `cname.vercel-dns.com`
   - **TTL:** 1 Hour
4. Salve

#### Se seu domínio está na Hostinger:

1. Painel → Domínios → Gerenciar
2. DNS/Nameservers → DNS Records
3. Adicione:
   - **Type:** CNAME
   - **Name:** `cultivo`
   - **Target:** `cname.vercel-dns.com`
4. Salve

6. **Aguarde propagação:** 5 minutos a 48 horas (geralmente 30 min)

7. Quando o domínio estiver ativo, o Vercel vai gerar SSL automaticamente

---

## Passo 9: Configurar Deploy Automático

✅ **Já está configurado!** Toda vez que você fizer push no GitHub:

```bash
git add .
git commit -m "Nova funcionalidade"
git push
```

O Vercel vai automaticamente:
1. Detectar o push
2. Fazer build
3. Deploy da nova versão
4. Atualizar o site em ~2 minutos

---

## 🔄 Atualizações Futuras

### Para atualizar o site:

```bash
# 1. Fazer mudanças no código
# 2. Testar localmente
npm run dev

# 3. Commitar e enviar
git add .
git commit -m "Descrição da mudança"
git push

# 4. Aguardar deploy automático (2-5 min)
```

### Para ver o status do deploy:

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto
3. Veja a aba **"Deployments"**

---

## 📊 Monitoramento

No dashboard do Vercel você pode ver:

- **Analytics:** Visitantes, páginas mais acessadas
- **Logs:** Erros do servidor em tempo real
- **Speed Insights:** Performance do site
- **Deployments:** Histórico de versões

---

## ❓ Problemas Comuns

### Erro: "Build failed"
- Verifique os logs no Vercel
- Certifique-se que `npm run build` funciona localmente
- Verifique se adicionou `--legacy-peer-deps` no Install Command

### Erro: "Database connection failed"
- Verifique a `DATABASE_URL` nas Environment Variables
- Certifique-se que copiou a connection string completa do PlanetScale
- Teste a conexão localmente primeiro

### Site não carrega após deploy
- Aguarde 2-5 minutos (pode demorar)
- Force refresh: Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
- Verifique os logs no Vercel

### Domínio customizado não funciona
- Aguarde até 48h para propagação DNS
- Verifique se o registro CNAME está correto
- Use https://dnschecker.org para verificar propagação

---

## 🔒 Segurança

### Proteger variáveis sensíveis:

1. **NUNCA** commite o arquivo `.env` no GitHub
2. Adicione ao `.gitignore`:

```
.env
.env.local
.env.production
```

3. Use apenas Environment Variables no Vercel

### Regenerar senha do banco:

Se a `DATABASE_URL` vazar:
1. Vá no PlanetScale → Connect → Delete password
2. Crie nova password
3. Atualize no Vercel → Settings → Environment Variables
4. Redeploy

---

## 💰 Custos

### Plano Hobby (Gratuito):
- ✅ Projetos ilimitados
- ✅ 100GB bandwidth/mês
- ✅ Domínios customizados ilimitados
- ✅ SSL gratuito
- ✅ Deploy automático

### Quando precisa upgrade:
- Mais de 100GB bandwidth/mês
- Mais de 6.000 minutos de build/mês
- Precisa de proteção DDoS avançada

---

## 🎯 Resultado Final

Agora você tem:

✅ **Banco de dados:** PlanetScale (gratuito, 5GB)  
✅ **Hospedagem:** Vercel (gratuito, ilimitado)  
✅ **Domínio:** Seu domínio customizado com SSL  
✅ **Deploy automático:** Push no GitHub = site atualizado  
✅ **Backups:** PlanetScale faz backup automático  
✅ **Monitoramento:** Analytics e logs em tempo real  

---

## 📚 Recursos Úteis

- **Vercel Docs:** https://vercel.com/docs
- **PlanetScale Docs:** https://planetscale.com/docs
- **Suporte Vercel:** https://vercel.com/support
- **Comunidade:** https://github.com/vercel/vercel/discussions

---

## 🚀 Próximos Passos

Agora que tudo está funcionando:

1. **Teste todas as funcionalidades** do app
2. **Configure alertas** (email/SMS) se precisar
3. **Personalize o domínio** e branding
4. **Monitore o uso** no PlanetScale e Vercel

**Dúvidas?** Consulte os guias ou entre em contato!
