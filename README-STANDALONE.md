# App Cultivo - Versão Standalone

Esta é uma versão **totalmente independente** do App Cultivo, sem dependências da plataforma Manus. Pode ser instalada e hospedada em qualquer servidor com Node.js e MySQL.

## Mudanças Realizadas

### 1. Autenticação

**Antes:** Manus OAuth (`server/_core/oauth.ts`, `server/_core/sdk.ts`)

**Depois:** Lucia Auth (`server/auth.ts`)

A autenticação agora utiliza `lucia-auth`, uma biblioteca open-source moderna que oferece:

- Gerenciamento de sessão seguro
- Suporte nativo ao Drizzle ORM
- Proteção CSRF automática
- Hashing de senha com `argon2` ou `bcryptjs`

**Arquivos Removidos:**
- `server/_core/oauth.ts`
- `server/_core/sdk.ts`
- `server/_core/cookies.ts`

**Arquivos Adicionados:**
- `server/auth.ts` - Configuração do Lucia Auth

### 2. Armazenamento de Fotos

**Antes:** Manus CDN (`manus-upload-file` CLI)

**Depois:** Armazenamento Local (`server/storageLocal.ts`)

As fotos agora são armazenadas no sistema de arquivos local do servidor, no diretório `uploads/`. O Express serve esses arquivos estaticamente.

**Benefícios:**
- Sem dependência de serviços externos
- Controle total sobre o armazenamento
- Ideal para servidores privados

### 3. Build e Deploy

**Antes:** Plugin Vite `vite-plugin-manus-runtime`

**Depois:** Configuração Vite padrão

O processo de build agora é completamente independente, sem qualquer integração com Manus.

## Instalação

### Pré-requisitos

- Node.js 22+
- MySQL 8.0+ (ou MariaDB 10.5+)
- pnpm (ou npm)

### Passos

1. **Clone o repositório:**
   ```bash
   git clone <seu-repositorio-standalone>
   cd cultivo-standalone
   ```

2. **Instale as dependências:**
   ```bash
   pnpm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```

   Edite o arquivo `.env` com suas configurações:
   ```env
   # Banco de Dados
   DATABASE_URL="mysql://usuario:senha@localhost:3306/cultivo"
   
   # Autenticação
   SESSION_SECRET="gere-uma-chave-aleatoria-segura-aqui"
   
   # Servidor
   PORT=3000
   NODE_ENV=development
   ```

4. **Crie o banco de dados:**
   ```bash
   mysql -u usuario -p -e "CREATE DATABASE cultivo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

5. **Execute as migrações:**
   ```bash
   pnpm db:push
   ```

6. **Popule dados de exemplo (opcional):**
   ```bash
   pnpm seed
   ```

7. **Inicie o servidor de desenvolvimento:**
   ```bash
   pnpm dev
   ```

   O aplicativo estará disponível em `http://localhost:3000`

## Deploy em Produção

### Opção 1: VPS (Recomendado)

1. **Prepare o servidor:**
   ```bash
   # Ubuntu/Debian
   sudo apt update && sudo apt upgrade
   sudo apt install nodejs npm mysql-server
   npm install -g pnpm
   ```

2. **Clone e configure:**
   ```bash
   git clone <seu-repositorio> /home/app/cultivo
   cd /home/app/cultivo
   pnpm install
   ```

3. **Configure variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite .env com suas configurações
   ```

4. **Execute as migrações:**
   ```bash
   pnpm db:push
   ```

5. **Build para produção:**
   ```bash
   pnpm build
   ```

6. **Configure um gerenciador de processos (PM2):**
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name cultivo
   pm2 save
   pm2 startup
   ```

7. **Configure um proxy reverso (Nginx):**
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
       }

       location /uploads {
           alias /home/app/cultivo/uploads;
           expires 30d;
       }
   }
   ```

### Opção 2: Docker

1. **Crie um `Dockerfile`:**
   ```dockerfile
   FROM node:22-alpine
   WORKDIR /app
   COPY package.json pnpm-lock.yaml ./
   RUN npm install -g pnpm && pnpm install
   COPY . .
   RUN pnpm build
   EXPOSE 3000
   CMD ["pnpm", "start"]
   ```

2. **Crie um `docker-compose.yml`:**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         DATABASE_URL: mysql://cultivo:senha@db:3306/cultivo
         SESSION_SECRET: sua-chave-secreta
       depends_on:
         - db
       volumes:
         - ./uploads:/app/uploads

     db:
       image: mysql:8.0
       environment:
         MYSQL_ROOT_PASSWORD: root-senha
         MYSQL_DATABASE: cultivo
         MYSQL_USER: cultivo
         MYSQL_PASSWORD: senha
       volumes:
         - db-data:/var/lib/mysql

   volumes:
     db-data:
   ```

3. **Inicie com Docker Compose:**
   ```bash
   docker-compose up -d
   ```

## Estrutura de Diretórios

```
cultivo-standalone/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilitários
│   └── public/            # Assets estáticos
├── server/                # Backend Express + tRPC
│   ├── _core/            # Core (sem Manus)
│   ├── auth.ts           # Autenticação com Lucia
│   ├── storage.ts        # Storage (removido Manus)
│   ├── storageLocal.ts   # Armazenamento local
│   ├── db.ts             # Query helpers
│   ├── nutrients.ts      # Cálculos de fertilização
│   ├── routers.ts        # Procedures tRPC
│   └── *.test.ts         # Testes
├── drizzle/              # Schema e migrações
├── shared/               # Tipos e constantes
├── uploads/              # Fotos (criado automaticamente)
└── docs/                 # Documentação
```

## Funcionalidades

Todas as funcionalidades do App Cultivo original estão disponíveis:

- ✅ CRUD de estufas, ciclos e plantas
- ✅ Calculadoras (rega, fertilização, pH, etc.)
- ✅ Sistema de alertas automáticos
- ✅ Logs diários de métricas
- ✅ Gráficos com Recharts
- ✅ PWA (instalável no celular)
- ✅ Temas escuro/claro
- ✅ Notificações toast
- ✅ Atalhos de teclado

## Desenvolvimento

### Scripts Disponíveis

```bash
pnpm dev          # Inicia servidor de desenvolvimento
pnpm build        # Build para produção
pnpm start        # Inicia servidor de produção
pnpm check        # Verifica tipos TypeScript
pnpm format       # Formata código com Prettier
pnpm test         # Executa testes
pnpm db:push      # Sincroniza schema do banco
pnpm seed         # Popula dados de exemplo
```

### Testes

```bash
pnpm test
```

Os testes incluem:

- Calculadora de sais minerais (19 testes)
- Procedures de watering (4 testes)
- Autenticação e logout
- Backup e restauração de dados

## Migração do Manus

Se você estava usando a versão Manus:

1. **Exporte seus dados:**
   ```bash
   # Na versão Manus
   pnpm export-backup
   ```

2. **Importe na versão Standalone:**
   ```bash
   # Na versão Standalone
   pnpm import-backup
   ```

## Suporte e Contribuição

Para dúvidas, problemas ou sugestões:

1. Abra uma issue no GitHub
2. Consulte a documentação em `docs/`
3. Verifique o arquivo `todo.md` para melhorias planejadas

## Licença

MIT - Todos os direitos reservados.

## Desenvolvido com 🌱

Para cultivadores que querem total controle sobre seus dados e infraestrutura.
