# App Cultivo - TODO

## ✅ Funcionalidades Concluídas

### Calculadoras
- [x] Calculadora de Runoff (% ideal, volume esperado, dicas)
- [x] Calculadora de Rega (volume por planta, volume total, ajuste por runoff real)
- [x] Calculadora de Fertilização (seletor fase/semana, EC recomendado, NPK, exportar TXT)
- [x] Calculadora de Fertilização - Predefinições (salvar, carregar, excluir, compartilhar receitas)
- [x] Reorganização: todas as calculadoras em uma única página com abas

### Sistema de Plantas
- [x] Modelo de dados completo (plants, plantTentHistory, plantObservations, plantPhotos, plantRunoffLogs, plantHealthLogs, plantTrichomeLogs, plantLSTLogs)
- [x] Backend tRPC completo (CRUD plantas, observações, fotos, runoff, saúde, tricomas, LST)
- [x] Página /plants com listagem agrupada por estufa (seções colapsáveis)
- [x] Filtros por status e busca por nome/código
- [x] Cards com foto, nome, código, strain, badge de saúde, fase do ciclo
- [x] Página /plants/new com formulário de criação
- [x] Página /plants/[id] com tabs (Saúde, Tricomas, LST, Observações)
- [x] Mover planta entre estufas (modal com cards visuais)
- [x] Transplantar para Flora
- [x] Finalizar planta (harvest)
- [x] Contador de plantas por estufa no dashboard

### Sistema de Fotos
- [x] Upload de fotos com compressão (1080x1440, aspect ratio iPhone 3:4)
- [x] Conversão automática HEIC/HEIF → JPEG
- [x] Galeria com lightbox (zoom, navegação, download, contador)
- [x] Fotos na aba de Saúde e Tricomas
- [x] Última foto aparece no card da planta
- [x] Storage S3 com storagePut()

### Aba de Saúde
- [x] Registro com data, status, sintomas, tratamento, notas, foto
- [x] Galeria lateral (foto à direita, dados à esquerda)
- [x] Accordion para lista longa
- [x] Editar e excluir registros (modal de edição, confirmação)

### Aba de Tricomas
- [x] Status (clear/cloudy/amber/mixed) com percentuais
- [x] Upload de foto macro
- [x] Semana do ciclo

### Aba de LST
- [x] Seletor visual de técnicas (LST, Topping, FIM, Super Cropping, Lollipopping, Defoliação, Mainlining, ScrOG)
- [x] Descrições detalhadas de cada técnica
- [x] Campo de resposta da planta

### Estufas e Ciclos
- [x] CRUD de estufas (A, B, C)
- [x] Gerenciamento de ciclos (iniciar, editar, finalizar)
- [x] Strains com targets semanais
- [x] Tarefas por estufa/semana
- [x] Logs diários (temperatura, RH, PPFD)

### Alertas
- [x] Sistema de alertas por desvio de métricas
- [x] Página de alertas com histórico
- [x] Configurações de alertas por estufa

### UX/UI Geral
- [x] Sidebar desktop + BottomNav mobile (Home, Plantas, Calculadoras, Alertas)
- [x] Splash screen
- [x] PWA (InstallPWA)
- [x] Tema escuro/claro
- [x] Widget de clima
- [x] Notificações toast (Sonner)
- [x] Exportação de receita para TXT

---

## 🔲 Itens Pendentes

### 🟡 Funcionalidades Incompletas

- [ ] Integrar WateringPresetsManager no IrrigationCalculator (componente existe mas não está conectado)
- [ ] Botão "Editar" em predefinições de fertilização (backend update existe, falta UI)
- [ ] Botão "Editar" em predefinições de rega (backend update existe, falta UI)
- [x] Adicionar aba "Plantas" na página de detalhes de cada estufa (TentDetails.tsx)

### 🟢 Melhorias de UX/UI

- [x] Lightbox para zoom nas fotos (corrigido: upload S3 + pointer-events-none no overlay)
- [ ] Suporte a gestos de swipe no mobile para navegar fotos no lightbox
- [x] Modal de edição de registro de saúde com formulário preenchido (EditHealthLogDialog - testado e funcional)

### 🔵 Testes que Requerem Dispositivo Físico

- [ ] Testar câmera no iPhone real (capture="environment")
- [ ] Testar conversão HEIC com foto real do iPhone
- [ ] Testar responsividade mobile em dispositivo real

### 📦 Documentação

- [x] Atualizar README com funcionalidades atuais
- [ ] Criar guia do usuário

### 🗑️ Limpeza (Opcional)

- [x] Remover tabela wateringLogs do banco (não é usada mais, mas não afeta funcionamento)
- [x] Remover arquivo PlantPhotosTab.tsx (não é importado em nenhum lugar)
- [x] Remover arquivo PlantRunoffTab.tsx (não é importado em nenhum lugar)
- [x] Remover arquivo Calculators.tsx.backup
- [x] Remover import de wateringLogs do routers.ts e schema.ts

---

## 📝 Histórico de Correções Recentes

- [x] Corrigir queries boolean no MySQL (isActive = true → isActive = 1)
- [x] Corrigir botão aninhado no AccordionTrigger do PlantHealthTab
- [x] Corrigir fotos não aparecendo nos cards (invalidação de cache)
- [x] Corrigir erro "Not authenticated" na calculadora de fertilização
- [x] Corrigir sinalizações duplicadas de fase no menu da planta
- [x] Criar tabelas faltantes no banco (strains, tents, plants, alerts, cycles, plantHealthLogs)

## Cards de Estufas Clicáveis + Aba Plantas na Estufa + README

- [x] Tornar cards de estufas na Home clicáveis para navegar às plantas da estufa
- [x] Adicionar aba "Plantas" na página de detalhes da estufa (TentDetails.tsx)
- [x] Atualizar README com funcionalidades atuais do projeto

## Modal de Edição de Registros de Saúde

- [x] Implementar modal de edição para registros de saúde (data, status, sintomas, tratamento, notas)
- [x] Conectar ao backend (procedure de update)
- [x] Testar edição e validar que dados são atualizados corretamente

## Revisão Completa do Upload de Imagens

- [x] Diagnosticar por que fotos não carregam após upload (storageUnified usava local em vez de S3)
- [x] Verificar fluxo completo: frontend base64 → backend → S3 → URL salva no banco
- [x] Corrigir exibição de fotos nos registros de saúde (accordion) - URL CloudFront funcional
- [x] Corrigir lightbox/zoom nas fotos (pointer-events-none no overlay + onClick no wrapper)
- [x] Verificar exibição da última foto no card da planta na listagem (já implementado, dependia de URL válida)
- [x] Testar fluxo completo de upload e exibição - testado com sucesso

## Redesign UX das Abas Saúde, Tricomas e LST

- [x] Redesenhar aba LST - layout compacto com grid de técnicas e info expandível ao clicar
- [x] Redesenhar aba Saúde - formulário colapsável, cards compactos com thumbnail e badges
- [x] Redesenhar aba Tricomas - formulário colapsável, status visual com botões, barra de proporção
- [x] Testar todas as abas redesenhadas - sem erros no console
- [x] Corrigir bug NaN dias (germDate → createdAt)

## Correção de Conexão MySQL

- [x] Trocar createConnection por createPool com reconexão automática (enableKeepAlive, idleTimeout)
- [x] Testar queries após restart - todas OK

## Investigação de Fotos Não Aparecendo

- [x] Verificar exibição de fotos em todas as páginas (Home, PlantsList, PlantDetail)
- [x] Diagnosticar causa raiz (URLs locais /uploads/ não funcionam - S3 CloudFront funciona)
- [x] Corrigir exibição de fotos (limpar URLs locais do banco, novos uploads usam S3)

## Dados de Demonstração (Seed)

- [x] Limpar todos os dados existentes do banco
- [x] Criar 6 strains principais (24K Gold, Candy Kush, Northern Lights, White Widow, Gorilla Glue, Amnesia Haze)
- [x] Criar 3 estufas (A Manutenção 45x75x90 65W, B Vega 60x60x120 240W, C Floração 60x120x150 320W)
- [x] Criar ciclos ativos para estufas B e C
- [x] Criar 8 plantas (2 em A, 3 em B, 3 em C)
- [x] Gerar registros diários (dailyLogs) de 1 semana (12-18/fev) para estufas B e C (28 registros)
- [x] Gerar registros de saúde (plantHealthLogs) de 1 semana para todas as plantas (30 registros)
- [x] Gerar registros de tricomas para plantas em floração (6 registros)
- [x] Gerar registros de LST para plantas em vega (5 registros)
- [x] Gerar observações para plantas (8 registros)
- [x] Criar predefinições de fertilização para vasos de 5L (5 presets)
- [x] Criar predefinições de rega para vasos de 5L (3 presets)
- [x] Criar receitas e templates de receitas (6 receitas, 5 templates)
- [x] Criar weekly targets para ciclos ativos (25 targets)

## Suporte a Múltiplas Strains por Estufa

- [x] Analisar arquitetura atual de ciclos/estufas/strains
- [x] Atualizar schema/backend para permitir múltiplas strains por ciclo/estufa (strainId nullable em cycles)
- [x] Atualizar UI para exibir múltiplas strains por estufa (Home cards com badges de strain)
- [x] Permitir criar ciclo sem strain definida (Start/Initiate/Edit modais atualizados)
- [x] Testar funcionalidade completa
- [x] Calcular targets semanais como média das strains quando estufa tem múltiplas strains (getTargetsByTent)

## Correção de Erro em AlertSettings

- [x] Investigar erro de inserção na tabela alertSettings (foreign key constraint - estufas não existiam)
- [x] Corrigir seed para criar alertSettings para todas as estufas
- [x] Testar página /alerts após correção - funcionando corretamente

## UX - Data da Semana Atual

- [x] Substituir "Data de Início" por "Data da Semana Atual" nos cards das estufas na Home
