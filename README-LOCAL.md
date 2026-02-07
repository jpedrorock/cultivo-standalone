# 🏠 App Cultivo - Setup Local (Independente do Manus)

Este guia explica como rodar o **App Cultivo** localmente, sem depender da plataforma Manus.

---

## 🚀 Instalação Rápida (Recomendado)

### Instalador Automático

O jeito mais fácil de instalar é usar o instalador automático que verifica e instala todas as dependências:

```bash
# 1. Extrair o pacote
unzip app-cultivo-v*.zip
cd app-cultivo-v*

# 2. Executar instalador automático
bash install.sh

# 3. Iniciar o servidor
pnpm dev
```

O instalador automático:
- ✅ Verifica Node.js e pnpm
- ✅ Instala todas as dependências
- ✅ Cria o banco de dados SQLite
- ✅ Aplica migrações automaticamente
- ✅ Importa dados de exemplo (3 estufas, ciclos, tarefas)
- ✅ Testa a conexão do banco

Após a instalação, acesse: **http://localhost:3000**

---

## 📋 Pré-requisitos

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** ([Instalação](https://pnpm.io/installation))
- **Git** (opcional, para clonar o repositório)

---

## 🚀 Instalação Rápida

### 1. Clone o repositório (ou extraia o ZIP)

```bash
git clone <seu-repositorio-url>
cd cultivo-architecture-docs
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure o banco de dados SQLite

O projeto está configurado para usar **SQLite** por padrão (banco local, sem servidor).

```bash
# Criar arquivo de banco de dados local
touch local.db

# Rodar migrações
pnpm db:push
```

### 4. Inicie o servidor de desenvolvimento

```bash
pnpm dev
```

O app estará disponível em: **http://localhost:3000**

---

## ⚙️ Configuração Avançada

### Banco de Dados

#### Opção 1: SQLite (Recomendado para uso local)

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="file:./local.db"
```

#### Opção 2: MySQL/TiDB (Produção)

```env
DATABASE_URL="mysql://user:password@localhost:3306/cultivo"
```

### Autenticação (Opcional)

Por padrão, o app funciona **sem autenticação** para uso local.

Para habilitar autenticação OAuth (Manus), configure:

```env
JWT_SECRET="sua-chave-secreta-aqui"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://manus.im/oauth"
VITE_APP_ID="seu-app-id"
```

### Storage de Arquivos (Opcional)

Por padrão, arquivos são salvos localmente em `./uploads`.

Para usar S3:

```env
AWS_ACCESS_KEY_ID="sua-access-key"
AWS_SECRET_ACCESS_KEY="sua-secret-key"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="seu-bucket"
```

### IA / LLM (Opcional)

Funcionalidades de IA estão desabilitadas por padrão. Para habilitar:

```env
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="sua-api-key"
```

---

## 📦 Build para Produção

### 1. Build do projeto

```bash
pnpm build
```

### 2. Inicie o servidor de produção

```bash
node dist/index.js
```

---

## 🗄️ Gerenciamento do Banco de Dados

### Criar nova migração

```bash
pnpm db:push
```

### Visualizar dados (opcional - instale Drizzle Studio)

```bash
npx drizzle-kit studio
```

Acesse: **http://localhost:4983**

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'better-sqlite3'"

```bash
pnpm add better-sqlite3 @types/better-sqlite3
```

### Erro: "Port 3000 is already in use"

Mude a porta no arquivo `.env`:

```env
PORT=3001
```

### Banco de dados vazio após migração

Execute novamente:

```bash
rm local.db
pnpm db:push
```

---

## 📁 Estrutura do Projeto

```
cultivo-architecture-docs/
├── client/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/       # Páginas do app
│   │   ├── components/  # Componentes reutilizáveis
│   │   └── lib/         # Utilitários e configurações
│   └── public/          # Arquivos estáticos
├── server/              # Backend (Express + tRPC)
│   ├── routers.ts       # Rotas da API
│   ├── db.ts            # Queries do banco
│   └── _core/           # Configurações internas
├── drizzle/             # Schemas e migrações do banco
├── shared/              # Código compartilhado (tipos, constantes)
├── local.db             # Banco SQLite (gerado automaticamente)
└── package.json         # Dependências e scripts
```

---

## 🔧 Scripts Disponíveis

```bash
pnpm dev          # Inicia servidor de desenvolvimento
pnpm build        # Build para produção
pnpm start        # Inicia servidor de produção
pnpm db:push      # Aplica migrações do banco
pnpm test         # Roda testes
pnpm format       # Formata código com Prettier
```

---

## 📝 Notas Importantes

- **SQLite** é ideal para uso local e testes, mas para produção recomenda-se **MySQL** ou **PostgreSQL**
- Sem autenticação, todos os usuários terão acesso total ao app
- Arquivos enviados (imagens, etc.) serão salvos em `./uploads` se S3 não estiver configurado
- O app foi desenvolvido originalmente no Manus, mas funciona 100% independente após este setup

---

## 🆘 Suporte

Para dúvidas ou problemas:

1. Verifique a seção **Troubleshooting** acima
2. Consulte a documentação do [Drizzle ORM](https://orm.drizzle.team/)
3. Abra uma issue no repositório do projeto

---

## 📄 Licença

[Adicione sua licença aqui]
