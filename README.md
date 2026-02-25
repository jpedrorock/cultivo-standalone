# 🌱 App Cultivo — Standalone

**Solução completa e de código aberto para gerenciamento de estufas indoor.** Controle ciclos, plantas, métricas ambientais, fertilização, alertas e muito mais — tudo rodando no seu próprio servidor, sem dependências de serviços externos.

> Esta é a versão **standalone** do App Cultivo, refatorada para funcionar de forma totalmente independente. Todas as dependências da plataforma Manus foram substituídas por alternativas open-source.

---

## Índice

- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Instalação](#instalação)
- [Deploy em Produção](#deploy-em-produção)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Banco de Dados](#banco-de-dados)
- [Rotas da Aplicação](#rotas-da-aplicação)
- [Testes](#testes)
- [Migração do Manus](#migração-do-manus)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## Funcionalidades

### Gerenciamento de Estufas e Ciclos

O aplicativo foi projetado para gerenciar até 3 estufas simultâneas, cada uma podendo estar em um estágio diferente do ciclo de cultivo. O fluxo principal envolve clonagem, período vegetativo, floração, colheita e secagem, com o objetivo de manter um fluxo contínuo de produção.

- CRUD completo de estufas com dimensões e tipo configuráveis
- Gerenciamento de ciclos: iniciar, editar, transicionar para flora e finalizar
- Strains com targets semanais por fase (temperatura, umidade, PPFD)
- Tarefas semanais por estufa com checklist
- Logs diários de métricas ambientais (temperatura, RH, PPFD)
- Gráficos de evolução temporal com Recharts

### Sistema de Plantas

- Cadastro com nome, código, strain e estufa
- Agrupamento por estufa com seções colapsáveis
- Filtros por status (Ativa/Colhida/Morta) e busca por nome/código
- Mover planta entre estufas com histórico completo
- Transplantar para fase de floração
- Finalizar planta (harvest)
- Ações em massa para múltiplas plantas simultaneamente

### Monitoramento de Saúde

- Registro com data, status (Saudável/Estressada/Doente/Recuperando), sintomas, tratamento e notas
- Upload de foto com galeria lateral e lightbox (zoom, navegação, download)
- Conversão automática de HEIC/HEIF para JPEG
- Compressão automática de imagens (1080x1440, aspect ratio 3:4)
- Histórico completo com accordion para registros longos

### Tricomas e LST

- Registro de maturação de tricomas (clear/cloudy/amber/mixed) com percentuais e foto macro
- Seletor visual de técnicas de LST: Topping, FIM, Super Cropping, Lollipopping, Defoliação, Mainlining, ScrOG
- Campo de resposta da planta para cada técnica aplicada

### Calculadoras Especializadas

| Calculadora | Descrição |
| :--- | :--- |
| **Rega e Runoff** | Volume ideal por planta, volume total, ajuste por runoff real e histórico de aplicações |
| **Fertilização** | Cálculo de sais minerais (Nitrato de Cálcio, Potássio, MKP, Sulfato de Magnésio, Micronutrientes) por fase/semana, EC estimado e NPK completo |
| **Lux → PPFD** | Conversão com slider visual |
| **PPM ↔ EC** | Conversão bidirecional |
| **Ajuste de pH** | Cálculo de ajustes necessários |

### Sistema de Alertas

- Alertas automáticos por desvio de métricas (Temperatura, RH, PPFD)
- Página de alertas com histórico detalhado
- Configurações de alertas por estufa com margens personalizáveis
- Verificação automática a cada hora via cron job

### Registro Rápido Diário

Página de registro guiado passo a passo, acessível como menu à parte. Permite registrar em sequência: temperatura, umidade, rega, runoff, pH, EC, PPFD, tarefas e saúde das plantas — com navegação horizontal entre as etapas.

### UX e Interface

- Sidebar para desktop e BottomNav para mobile
- Splash screen animada
- PWA instalável no celular
- Temas escuro e claro
- Teclado numérico automático em campos de entrada de valores
- Notificações toast com Sonner
- Atalhos de teclado (Ctrl+N, Ctrl+H, Ctrl+C)

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
| :--- | :--- | :--- |
| **Frontend** | React | 19.2.1 |
| **Linguagem** | TypeScript | 5.9.3 |
| **Estilo** | Tailwind CSS | 4.1.14 |
| **Componentes UI** | shadcn/ui + Radix UI | — |
| **Roteamento** | Wouter | 3.3.5 |
| **API Client** | tRPC + TanStack React Query | 11.6.0 |
| **Gráficos** | Recharts | 3.7.0 |
| **Backend** | Express | 4.21.2 |
| **API Server** | tRPC | 11.6.0 |
| **Runtime** | Node.js | 22+ |
| **Banco de Dados** | MySQL 8.0+ / MariaDB 10.5+ | — |
| **ORM** | Drizzle ORM | 0.44.5 |
| **Autenticação** | Lucia Auth | 3.0.0 |
| **Hash de Senhas** | Argon2 / Bcryptjs | — |
| **Storage** | Sistema de Arquivos Local | — |
| **Build** | Vite + ESBuild | 7.1.7 |
| **Testes** | Vitest | 2.1.4 |

---

## Instalação

### Pré-requisitos

- Node.js 22+
- MySQL 8.0+ ou MariaDB 10.5+
- pnpm

### Passo a Passo

**1. Clone o repositório:**

```bash
git clone https://github.com/jpedrorock/cultivo-standalone.git
cd cultivo-standalone
```

**2. Instale as dependências:**

```bash
pnpm install
```

**3. Configure as variáveis de ambiente:**

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/cultivo"
SESSION_SECRET="gere-uma-chave-aleatoria-segura-aqui"
PORT=3000
NODE_ENV=development
```

Para gerar uma chave segura para `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**4. Crie o banco de dados:**

```bash
mysql -u usuario -p -e "CREATE DATABASE cultivo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**5. Execute as migrações:**

```bash
pnpm db:push
```

**6. (Opcional) Popule com dados de exemplo:**

```bash
pnpm seed
```

**7. Inicie o servidor de desenvolvimento:**

```bash
pnpm dev
```

O aplicativo estará disponível em `http://localhost:3000`.

### Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `pnpm dev` | Inicia o servidor de desenvolvimento com hot-reload |
| `pnpm build` | Gera o bundle de produção |
| `pnpm start` | Inicia o servidor em modo produção |
| `pnpm check` | Verifica tipos TypeScript |
| `pnpm format` | Formata o código com Prettier |
| `pnpm test` | Executa os testes com Vitest |
| `pnpm db:push` | Sincroniza o schema do banco de dados |
| `pnpm seed` | Popula o banco com dados de exemplo |

---

## Deploy em Produção

### Opção 1: VPS com PM2 e Nginx (Recomendado)

**1. Prepare o servidor (Ubuntu/Debian):**

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nodejs npm mysql-server nginx
npm install -g pnpm pm2
```

**2. Clone e configure:**

```bash
git clone https://github.com/jpedrorock/cultivo-standalone.git /home/app/cultivo
cd /home/app/cultivo
pnpm install
cp .env.example .env
# Edite .env com suas credenciais de produção
```

**3. Execute as migrações e o build:**

```bash
pnpm db:push
pnpm build
```

**4. Configure o PM2:**

```bash
pm2 start dist/index.js --name cultivo
pm2 save
pm2 startup
```

**5. Configure o Nginx como proxy reverso:**

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
        add_header Cache-Control "public, immutable";
    }
}
```

### Opção 2: Docker Compose

Crie um arquivo `docker-compose.yml` na raiz do projeto:

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
      NODE_ENV: production
    depends_on:
      db:
        condition: service_healthy
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
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

volumes:
  db-data:
```

Inicie com:

```bash
docker-compose up -d
```

---

## Estrutura do Projeto

```
cultivo-standalone/
├── client/                     # Frontend React
│   ├── src/
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── hooks/             # Custom hooks
│   │   └── lib/               # Utilitários e configurações
│   └── public/                # Assets estáticos e Service Worker
├── server/                     # Backend Express + tRPC
│   ├── _core/                 # Infraestrutura (auth, storage, vite)
│   ├── auth.ts                # Configuração do Lucia Auth
│   ├── storageLocal.ts        # Armazenamento local de arquivos
│   ├── routers.ts             # Procedures tRPC
│   ├── db.ts                  # Query helpers do banco de dados
│   ├── nutrients.ts           # Cálculos de fertilização
│   ├── watering.ts            # Helpers de rega
│   ├── alertChecker.ts        # Verificação automática de alertas
│   └── *.test.ts              # Testes Vitest
├── drizzle/                    # Schema e relações do banco de dados
├── shared/                     # Tipos e constantes compartilhados
├── uploads/                    # Fotos das plantas (criado automaticamente)
├── .env.example                # Exemplo de variáveis de ambiente
├── MIGRATION-GUIDE.md          # Guia de migração do Manus
└── DEPENDENCIES.md             # Análise de dependências
```

---

## Banco de Dados

O schema é gerenciado via Drizzle ORM em `drizzle/schema.ts`. O banco de dados contém **32 tabelas** organizadas nos seguintes domínios:

| Domínio | Tabelas |
| :--- | :--- |
| **Usuários** | `users` |
| **Estufas e Ciclos** | `tents`, `cycles`, `tentAState` |
| **Plantas** | `plants`, `plantTentHistory`, `plantObservations` |
| **Saúde e Monitoramento** | `plantHealthLogs`, `plantTrichomeLogs`, `plantLSTLogs`, `plantPhotos`, `plantRunoffLogs` |
| **Métricas** | `dailyLogs`, `weeklyTargets` |
| **Strains** | `strains`, `safetyLimits` |
| **Alertas** | `alerts`, `alertHistory`, `alertSettings`, `alertPreferences`, `phaseAlertMargins` |
| **Nutrição** | `nutrientApplications`, `recipes`, `recipeTemplates`, `fertilizationPresets` |
| **Rega** | `wateringApplications`, `wateringPresets` |
| **Tarefas** | `taskTemplates`, `taskInstances` |
| **Notificações** | `notificationSettings`, `notificationHistory` |
| **Clonagem** | `cloningEvents` |

---

## Rotas da Aplicação

| Rota | Página |
| :--- | :--- |
| `/` | Home — Dashboard com estufas, métricas e ações rápidas |
| `/plants` | Lista de plantas agrupadas por estufa |
| `/plants/new` | Formulário de nova planta |
| `/plants/:id` | Detalhes da planta (Saúde, Tricomas, LST, Observações) |
| `/tent/:id` | Detalhes da estufa (Gráficos, Histórico, Plantas) |
| `/tent/:id/log` | Novo registro diário |
| `/quick-log` | Registro rápido diário guiado |
| `/calculators` | Hub de calculadoras |
| `/calculators/watering-runoff` | Calculadora de Rega e Runoff |
| `/calculators/nutrients` | Calculadora de Fertilização |
| `/calculators/lux-ppfd` | Conversor Lux → PPFD |
| `/calculators/ppm-ec` | Conversor PPM ↔ EC |
| `/calculators/ph-adjust` | Calculadora de pH |
| `/alerts` | Sistema de alertas |
| `/alerts/history` | Histórico de alertas |
| `/alerts/settings` | Configurações de alertas |
| `/history` | Histórico de registros por estufa |
| `/nutrients` | Página de nutrientes e receitas |
| `/strains` | Gerenciamento de strains |
| `/tasks` | Tarefas semanais |
| `/settings` | Configurações do aplicativo |
| `/backup` | Exportar e importar dados |

---

## Testes

Execute os testes com:

```bash
pnpm test
```

A suíte de testes inclui:

| Arquivo de Teste | Descrição | Testes |
| :--- | :--- | :--- |
| `nutrients.mineral.test.ts` | Calculadora de sais minerais | 19 |
| `watering.test.ts` | Procedures de rega | 4 |
| `auth.logout.test.ts` | Autenticação e logout | 3 |
| `backup.test.ts` | Exportação e importação de dados | 5 |
| `cycles.test.ts` | Gerenciamento de ciclos | 8 |
| `plants.edit.test.ts` | Edição de plantas | 6 |
| `alerts.checkAllTents.test.ts` | Verificação de alertas | 7 |

---

## Migração do Manus

Esta versão standalone substituiu as seguintes dependências da plataforma Manus:

| Dependência Manus | Substituição Open-Source |
| :--- | :--- |
| **Manus OAuth** | Lucia Auth (autenticação local) |
| **Manus CDN** | Armazenamento local (`/uploads`) |
| **vite-plugin-manus-runtime** | Vite padrão |
| **AWS SDK** | Removido (não necessário) |

Para instruções detalhadas sobre a migração, consulte o arquivo [MIGRATION-GUIDE.md](MIGRATION-GUIDE.md).

---

## Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas mudanças (`git commit -m 'feat: Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## Licença

Este projeto está licenciado sob a Licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com 🌱 para cultivadores que querem total controle sobre seus dados.**
