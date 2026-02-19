# App Cultivo - Gerenciamento de Estufas

Aplicação web para gerenciamento completo de estufas de cultivo indoor, incluindo controle de ciclos, monitoramento ambiental, gerenciamento de plantas, calculadoras especializadas e sistema de alertas.

## 📋 Visão Geral

O App Cultivo foi projetado para gerenciar até 3 estufas simultâneas, cada uma podendo estar em um estágio diferente do ciclo de cultivo. O fluxo principal envolve clonagem, período vegetativo, floração, colheita e secagem, com o objetivo de manter um fluxo contínuo de produção.

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 22+ e pnpm
- Banco de dados MySQL (ou TiDB)
- Conta no Manus (recomendado) ou Vercel/Railway

### Instalação Local

```bash
# Clone o repositório
git clone <seu-repositorio>
cd cultivo-architecture-docs

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Execute as migrações do banco
pnpm db:push

# Inicie o servidor de desenvolvimento
pnpm dev
```

O aplicativo estará disponível em `http://localhost:3000`

### Deploy Rápido no Manus

O Manus oferece hospedagem integrada com domínio customizado, SSL automático e banco de dados gerenciado:

1. Crie um checkpoint no Manus UI
2. Clique em "Publish" no header
3. Configure seu domínio (opcional)
4. Pronto! Seu app está no ar ✨

## 📚 Documentação Completa

- **[INSTALACAO.md](./INSTALACAO.md)** - Guia detalhado de instalação local (Windows, Mac, Linux)
- **[DEPLOY.md](./DEPLOY.md)** - Instruções de deploy (Manus, Vercel, Railway)
- **[GUIA-USUARIO.md](./GUIA-USUARIO.md)** - Manual completo de uso do aplicativo

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Tailwind CSS 4 |
| UI Components | shadcn/ui |
| Roteamento | Wouter |
| Estado/API | tRPC 11 + TanStack React Query |
| Backend | Express 4 + tRPC |
| Banco de Dados | MySQL/TiDB + Drizzle ORM |
| Storage | AWS S3 (fotos) |
| Autenticação | Manus OAuth |
| PWA | Service Worker + Install Prompt |

## ✨ Funcionalidades Principais

### Estufas e Ciclos
- CRUD completo de estufas (tipos A, B, C com dimensões configuráveis)
- Gerenciamento de ciclos de cultivo (iniciar, editar, transicionar para flora, finalizar)
- Strains com targets semanais por fase (temperatura, umidade, PPFD)
- Tarefas semanais por estufa com checklist
- Logs diários de métricas ambientais (temperatura, RH, PPFD)
- Gráficos de evolução temporal (Recharts)

### Sistema de Plantas
- Cadastro com nome, código, strain e estufa
- Agrupamento por estufa com seções colapsáveis
- Filtros por status (Ativa/Colhida/Morta) e busca por nome/código
- Mover planta entre estufas com histórico
- Transplantar para fase de floração
- Finalizar planta (harvest)

### Aba de Saúde
- Registro com data, status (Saudável/Estressada/Doente/Recuperando), sintomas, tratamento, notas
- Upload de foto com galeria lateral
- Accordion para histórico longo
- Editar e excluir registros

### Aba de Tricomas
- Status de maturação (clear/cloudy/amber/mixed) com percentuais
- Upload de foto macro
- Semana do ciclo

### Aba de LST (Low Stress Training)
- Seletor visual de técnicas: LST, Topping, FIM, Super Cropping, Lollipopping, Defoliação, Mainlining, ScrOG
- Descrições detalhadas de cada técnica
- Campo de resposta da planta

### Sistema de Fotos
- Upload com compressão automática (1080x1440, aspect ratio 3:4)
- Conversão automática HEIC/HEIF para JPEG
- Galeria com lightbox (zoom, navegação, download)
- Última foto exibida no card da planta
- Storage S3

### Calculadoras
- **Rega e Runoff**: volume ideal por planta, volume total, ajuste por runoff real, histórico de aplicações
- **Fertilização**: cálculo de sais minerais (Nitrato de Cálcio, Potássio, MKP, Sulfato de Magnésio, Micronutrientes) por fase/semana, EC estimado, NPK completo, histórico de receitas
- **Conversor Lux → PPFD**: conversão com slider visual
- **Conversor PPM ↔ EC**: conversão bidirecional
- **Calculadora de pH**: ajustes necessários de pH

### Sistema de Alertas
- Alertas automáticos por desvio de métricas (Temp/RH/PPFD)
- Página de alertas com histórico
- Configurações de alertas por estufa
- Verificação automática a cada hora

### UX/UI
- Sidebar desktop + BottomNav mobile
- Splash screen animada
- PWA (instalável no celular)
- Tema escuro/claro
- Widget de clima externo
- Notificações toast (Sonner)
- Atalhos de teclado (Ctrl+N, Ctrl+H, Ctrl+C)

## 🗺️ Estrutura de Navegação

| Rota | Página |
|------|--------|
| `/` | Home - Dashboard com estufas, métricas e ações rápidas |
| `/plants` | Lista de plantas agrupadas por estufa |
| `/plants/new` | Formulário de nova planta |
| `/plants/:id` | Detalhes da planta (Saúde, Tricomas, LST, Observações) |
| `/tent/:id` | Detalhes da estufa (Gráficos, Histórico, Plantas) |
| `/tent/:id/log` | Novo registro diário |
| `/calculators` | Hub de calculadoras |
| `/calculators/watering-runoff` | Calculadora de Rega e Runoff |
| `/calculators/nutrients` | Calculadora de Fertilização |
| `/calculators/lux-ppfd` | Conversor Lux → PPFD |
| `/calculators/ppm-ec` | Conversor PPM ↔ EC |
| `/calculators/ph-adjust` | Calculadora de pH |
| `/alerts` | Sistema de alertas |
| `/history` | Histórico de registros |
| `/manage-strains` | Gerenciamento de strains |
| `/settings` | Configurações |

## 🔧 Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev

# Sincronizar schema do banco
pnpm db:push

# Executar testes
pnpm test

# Build de produção
pnpm build
```

## 🗄️ Banco de Dados

O schema é gerenciado via Drizzle ORM em `drizzle/schema.ts`. Principais tabelas:

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários com role (admin/user) |
| `tents` | Estufas com dimensões e tipo |
| `strains` | Variedades de plantas |
| `cycles` | Ciclos de cultivo por estufa |
| `dailyLogs` | Registros diários (temp, RH, PPFD) |
| `weeklyTargets` | Targets ideais por strain/fase/semana |
| `plants` | Plantas individuais |
| `plantHealthLogs` | Registros de saúde |
| `plantTrichomeLogs` | Registros de tricomas |
| `plantLSTLogs` | Registros de treinamento |
| `plantPhotos` | Fotos das plantas |
| `plantObservations` | Observações gerais |
| `plantRunoffLogs` | Registros de runoff |
| `plantTentHistory` | Histórico de movimentação |
| `alerts` | Alertas do sistema |
| `alertHistory` | Histórico de alertas |
| `alertSettings` | Configurações de alertas |
| `nutrientApplications` | Histórico de aplicações de fertilizantes |
| `wateringApplications` | Histórico de aplicações de rega |
| `taskTemplates` | Templates de tarefas |
| `taskInstances` | Instâncias de tarefas semanais |

## 🧪 Testes

Execute os testes com:

```bash
pnpm test
```

Testes incluem:
- Calculadora de sais minerais (19 testes - 100% passando)
- Procedures de watering (4 testes - 100% passando)
- Autenticação e logout

## 📁 Estrutura do Projeto

```
cultivo-architecture-docs/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilitários e configurações
│   └── public/            # Assets estáticos
├── server/                # Backend Express + tRPC
│   ├── _core/            # Infraestrutura (OAuth, LLM, S3)
│   ├── routers.ts        # Definição de procedures tRPC
│   ├── db.ts             # Query helpers
│   ├── nutrients.ts      # Cálculos de fertilização
│   ├── watering.ts       # Helpers de rega
│   └── *.test.ts         # Testes vitest
├── drizzle/              # Schema e migrações do banco
├── shared/               # Tipos e constantes compartilhados
└── docs/                 # Documentação adicional
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Projeto privado - Todos os direitos reservados.

## 📧 Suporte

Para dúvidas ou problemas, abra uma issue no repositório ou consulte a [documentação completa](./GUIA-USUARIO.md).

---

**Desenvolvido com 🌱 para cultivadores**
