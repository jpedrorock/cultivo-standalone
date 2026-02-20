# 📥 Como Obter o Código para Deploy

Existem 3 formas de obter o código-fonte completo do App Cultivo para instalar em outro servidor:

---

## Opção 1: Download pelo Manus UI (Mais Fácil)

1. Acesse o **Management UI** do projeto no Manus
2. Clique na aba **"Code"** (código) no painel lateral direito
3. Clique no botão **"Download All Files"** (baixar todos os arquivos)
4. Um arquivo ZIP será baixado com todo o código-fonte

**Vantagens:**
- ✅ Mais rápido e simples
- ✅ Não precisa de Git instalado
- ✅ Inclui apenas arquivos necessários (sem node_modules, .git, etc.)

---

## Opção 2: Clone do GitHub (Recomendado para Desenvolvedores)

O projeto está conectado ao GitHub. Para clonar:

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/cultivo-architecture-docs.git
cd cultivo-architecture-docs

# Instalar dependências
pnpm install
```

**Vantagens:**
- ✅ Permite atualizações via `git pull`
- ✅ Histórico completo de commits
- ✅ Facilita contribuições e modificações

**Como encontrar a URL do repositório:**
1. Acesse o Management UI do projeto no Manus
2. Vá em **Settings** → **GitHub**
3. Copie a URL do repositório mostrada

---

## Opção 3: Exportar do Sandbox (Avançado)

Se você tem acesso ao sandbox do Manus:

```bash
# No sandbox, criar arquivo ZIP
cd /home/ubuntu
zip -r app-cultivo-deploy.zip cultivo-architecture-docs \
  -x "cultivo-architecture-docs/node_modules/*" \
  -x "cultivo-architecture-docs/.git/*" \
  -x "cultivo-architecture-docs/dist/*" \
  -x "cultivo-architecture-docs/.manus-logs/*" \
  -x "cultivo-architecture-docs/.env" \
  -x "cultivo-architecture-docs/*.log"

# Baixar o arquivo ZIP gerado
```

---

## 📦 O que fazer após obter o código

### 1. Extrair Arquivos

```bash
# Se baixou ZIP
unzip app-cultivo-deploy.zip
cd cultivo-architecture-docs

# Se clonou do Git
cd cultivo-architecture-docs
```

### 2. Seguir Guia de Instalação

Consulte um dos guias de instalação incluídos:

- **[LEIA-ME-DEPLOY.md](./LEIA-ME-DEPLOY.md)** - Início rápido
- **[INSTALACAO.md](./INSTALACAO.md)** - Guia completo de instalação em servidor próprio
- **[DEPLOY.md](./DEPLOY.md)** - Opções de deploy (Manus, Vercel, Railway)

### 3. Executar Script de Setup

```bash
# Tornar script executável (se necessário)
chmod +x setup.sh

# Executar instalação automatizada
./setup.sh
```

O script irá guiá-lo por todo o processo de instalação.

---

## 🔧 Arquivos Importantes Incluídos

- `setup.sh` - Script de instalação automatizado
- `package.json` - Dependências do projeto
- `drizzle.config.ts` - Configuração do banco de dados
- `drizzle/schema.ts` - Schema completo do banco
- `client/` - Código frontend (React + Tailwind)
- `server/` - Código backend (tRPC + Express)
- `shared/` - Código compartilhado (tipos, constantes)

---

## 📚 Próximos Passos

Após obter o código:

1. ✅ Instale as dependências (Node.js 22+, pnpm, MySQL 8+)
2. ✅ Configure o arquivo `.env` com suas credenciais
3. ✅ Execute `./setup.sh` ou siga o guia manual
4. ✅ Acesse `http://localhost:3000`

Para deploy em produção:
- Configure Nginx como proxy reverso
- Obtenha certificado SSL com Certbot
- Use PM2 para gerenciar o processo Node.js
- Configure backup automático do banco de dados

---

## 📞 Suporte

Se tiver dúvidas:
- Consulte [INSTALACAO.md](./INSTALACAO.md) para guia detalhado
- Consulte [DEPLOY.md](./DEPLOY.md) para opções de hospedagem
- Verifique os logs de erro em `.manus-logs/` (se aplicável)

---

**Desenvolvido com 🌱 para cultivadores**
