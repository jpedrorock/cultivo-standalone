# App Cultivo - Gerenciamento de Estufas

Aplicação web para gerenciamento completo de estufas de cultivo indoor, incluindo controle de ciclos, monitoramento ambiental, gerenciamento de plantas, calculadoras especializadas e sistema de alertas.

## Visão Geral

O App Cultivo foi projetado para gerenciar até 3 estufas simultâneas, cada uma podendo estar em um estágio diferente do ciclo de cultivo. O fluxo principal envolve clonagem, período vegetativo, floração, colheita e secagem, com o objetivo de manter um fluxo contínuo de produção.

## Stack Tecnológica

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

## Funcionalidades

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
- **Rega e Runoff**: volume ideal por planta, volume total, ajuste por runoff real
- **Fertilização**: seletor fase/semana, EC recomendado, NPK, micronutrientes (Ca, Mg, Fe), exportar TXT
- **Predefinições de Fertilização**: salvar, carregar, excluir, compartilhar receitas
- **Conversor Lux → PPFD**: conversão com slider visual
- **Conversor PPM ↔ EC**: conversão bidirecional
- **Calculadora de pH**: ajustes necessários de pH

### Sistema de Alertas
- Alertas automáticos por desvio de métricas (Temp/RH/PPFD)
- Página de alertas com histórico
- Configurações de alertas por estufa

### UX/UI
- Sidebar desktop + BottomNav mobile
- Splash screen animada
- PWA (instalável no celular)
- Tema escuro/claro
- Widget de clima externo
- Notificações toast (Sonner)
- Atalhos de teclado (Ctrl+N, Ctrl+H, Ctrl+C)

## Estrutura de Navegação

| Rota | Página |
|------|--------|
| `/` | Home - Dashboard com estufas, métricas e ações rápidas |
| `/plants` | Lista de plantas agrupadas por estufa |
| `/plants/new` | Formulário de nova planta |
| `/plants/:id` | Detalhes da planta (Saúde, Tricomas, LST, Observações) |
| `/tent/:id` | Detalhes da estufa (Gráficos, Histórico, Plantas) |
| `/tent/:id/log` | Novo registro diário |
| `/calculators` | Hub de calculadoras |
| `/calculators/irrigation` | Calculadora de Rega e Runoff |
| `/calculators/fertilization` | Calculadora de Fertilização |
| `/calculators/lux-ppfd` | Conversor Lux → PPFD |
| `/calculators/ppm-ec` | Conversor PPM ↔ EC |
| `/calculators/ph` | Calculadora de pH |
| `/alerts` | Sistema de alertas |
| `/history` | Histórico de registros |
| `/manage-strains` | Gerenciamento de strains |
| `/settings` | Configurações |

## Desenvolvimento

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

## Banco de Dados

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
| `alertSettings` | Configurações de alertas |
| `fertilizationPresets` | Predefinições de fertilização |
| `wateringPresets` | Predefinições de rega |
| `taskTemplates` | Templates de tarefas |
| `taskInstances` | Instâncias de tarefas semanais |
| `recipes` | Receitas de fertilização |

## Licença

Projeto privado - Todos os direitos reservados.
