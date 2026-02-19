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

- [x] Integrar WateringPresetsManager no IrrigationCalculator (componente existe mas não estava conectado)
- [x] Botão "Editar" em predefinições de fertilização (backend update existe, UI implementada)
- [x] Botão "Editar" em predefinições de rega (backend update existe, UI implementada)
- [x] Adicionar aba "Plantas" na página de detalhes de cada estufa (TentDetails.tsx)

### 🟢 Melhorias de UX/UI

- [x] Lightbox para zoom nas fotos (corrigido: upload S3 + pointer-events-none no overlay)
- [ ] Suporte a gestos de swipe no mobile para navegar fotos no lightbox
- [x] Modal de edição de registro de saúde com formulário preenchido (EditHealthLogDialog - testado e funcional)

### 🔵 Testes que Requerem Dispositivo Físico

- [x] Testar câmera no iPhone real (capture="environment")
- [x] Testar conversão HEIC com foto real do iPhone
- [x] Testar responsividade mobile em dispositivo real

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

## Integração WateringPresetsManager

- [x] Analisar componente WateringPresetsManager existente
- [x] Integrar WateringPresetsManager no WateringRunoffCalculator
- [x] Conectar funcionalidade de salvar/carregar presets
- [x] Testar fluxo completo de criar, salvar e carregar presets de rega - funcionando perfeitamente

## Edição de Presets

- [x] Analisar procedures de update no backend (wateringPresets.update e fertilizationPresets.update)
- [x] Criar modal de edição para presets de rega (integrado no WateringPresetsManager)
- [x] Adicionar botão "Editar" no WateringPresetsManager (todos os campos editáveis)
- [x] Criar modal de edição para presets de fertilização (integrado no FertilizationCalculator)
- [x] Adicionar botão "Editar" no FertilizationCalculator (apenas nome editável)
- [x] Testar fluxo completo de edição em ambos os tipos de presets - funcionando

## Bug - Tarefas das Semanas Sumiram

- [x] Investigar por que as tarefas das semanas sumiram (tabela taskTemplates estava vazia)
- [x] Adicionar 40 templates de tarefas ao seed (VEGA sem 1-4, FLORA sem 1-8, MAINTENANCE)
- [x] Executar seed e verificar tarefas aparecendo corretamente na página /tasks

## Revisão de Design e Usabilidade Mobile

- [x] Revisar Home (cards de estufas, navegação, badges de strain)
- [x] Revisar página de Plantas (lista, filtros, cards)
- [x] Revisar detalhes de Planta (abas, formulários, galeria)
- [x] Revisar Calculadoras (inputs, resultados, presets)
- [x] Revisar Histórico (tabela, filtros, gráficos)
- [x] Revisar Alertas (configurações, histórico)
- [ ] Revisar Strains (lista, detalhes)
- [ ] Revisar Tasks (lista de tarefas, checkboxes)
- [ ] Revisar Configurações (formulários, seções)
- [x] Documentar todos os problemas encontrados (5 críticos + 6 melhorias)
- [x] Implementar correções críticas (tarefas colapsadas por padrão, touch targets 44x44px, espaçamento aumentado)
- [ ] Implementar melhorias recomendadas (tabela responsiva, feedback visual, hierarquia)
- [x] Testar melhorias na Home (tarefas colapsáveis funcionando perfeitamente)
- [ ] Testar em dispositivo real (iPhone) para validar touch targets e responsividade


## Card View para Histórico Mobile

- [x] Analisar componente HistoryTable atual (já tinha card view implementado)
- [x] Melhorar card view existente com melhor hierarquia visual e espaçamento
- [x] Ajustar breakpoint de md para lg (cards até 1024px, tabela acima)
- [x] Testar card view - funcionando em viewports < 1024px


## Bug - Tarefas da Estufa A não aparecem

- [x] Investigar por que tarefas da Estufa A (MAINTENANCE) não estavam aparecendo (weekNumber NULL não era tratado)
- [x] Verificar se taskTemplates de MAINTENANCE existem no banco (3 tarefas encontradas)
- [x] Corrigir lógica de busca de tarefas para incluir fase MAINTENANCE (getTasksByTent atualizado)
- [x] Testar tarefas da Estufa A - funcionando corretamente (Regar plantas-mãe, Fazer clones, Podar plantas-mãe)

## Gerenciador de Tarefas Personalizadas

- [x] Criar procedures backend para CRUD de taskTemplates (create, update, delete, list)
- [x] Criar componente TaskTemplatesManager na página de Tasks com Tabs
- [x] Implementar modal de criar/editar taskTemplate (fase, semana, contexto, título, descrição)
- [x] Implementar listagem de taskTemplates por fase/contexto (40 templates listados)
- [x] Implementar botões de editar e excluir em cada taskTemplate
- [x] Testar modal de criar taskTemplate - funcionando perfeitamente
- [x] Testar modal de editar taskTemplate - funcionando perfeitamente
- [x] Testar exclusão de taskTemplate - funcionando perfeitamente
- [x] Verificar integração com aba "Tarefas da Semana" - funcionando


## Reimplementação Gerenciador de Tarefas (Pós-Reset)

- [x] Corrigir erros TypeScript existentes (protectedProcedure não importado)
- [x] Implementar procedures backend CRUD taskTemplates (create, update, delete, list)
- [x] Criar componente TaskTemplatesManager
- [x] Integrar na página Tasks com Tabs ("Tarefas da Semana" e "Gerenciar")
- [x] Testar funcionalidade completa (CREATE, UPDATE, DELETE testados com sucesso)

## Correção de Problemas Mobile Reportados (19/02/2026)

- [x] Corrigir sobreposição de elementos na página de detalhes da planta (adicionado pb-32 ao main em PlantDetail.tsx)
- [x] Corrigir erro "Not authenticated" ao salvar predefinições (trocado publicProcedure por protectedProcedure em wateringPresets e fertilizationPresets)
- [x] Corrigir erro de validação ao salvar predefinições de fertilização:
  - targetEC: Number() para garantir tipo number (linha 36 FertilizationCalculator.tsx)
  - phase: conversão explícita "vega" → "VEGA" (linha 124)
  - irrigationsPerWeek: undefined ao invés de null (linha 130)
- [x] Testar salvamento de predefinições no navegador (predefinição "Teste Final Fertilização" salva com sucesso)
- [ ] Testar em dispositivo real (iPhone) para validar correções

## Correção de Warnings TypeScript (19/02/2026)

- [x] Identificar todos os 32 erros TypeScript
- [x] Corrigir imports faltando (AlertCircle, CheckCircle2 em Calculators.tsx)
- [x] Corrigir tipos any implícitos em todos os arquivos (17 arquivos corrigidos)
- [x] Remover propriedades inválidas (vibrate em NotificationOptions)
- [x] Corrigir tipos de enum (Phase em TaskTemplatesManager)
- [x] Corrigir toast em PlantObservationsTab (sonner)
- [x] Testar compilação - 0 erros TypeScript restantes
- [x] Verificar servidor - rodando sem erros

## Correções Adicionais Mobile (19/02/2026 - Parte 2)

- [x] Remover autenticação obrigatória ao salvar predefinições (trocado protectedProcedure por publicProcedure)
- [x] Remover referências a ctx.user nas procedures públicas (removidas cláusulas where com userId)
- [x] Corrigir sobreposição das tabs (Saúde, Tricomas, LST, Observações) - trocado grid por flex com overflow-x-auto
- [x] Reduzir margens laterais dos cards no mobile (container padding reduzido de 16px para 12px)
- [x] Testar salvamento de predefinições sem autenticação (predefinição "Teste Sem Autenticação" salva com sucesso)
- [x] Gerenciador de tarefas localizado em /tasks aba "Gerenciar" (ao lado de "Tarefas da Semana")

## Animação de Carregamento para Galeria (19/02/2026)

- [x] Criar componente SkeletonLoader para galeria de fotos (SkeletonLoader.tsx e GallerySkeletonLoader)
- [x] Implementar estado de loading na galeria (PlantPhotosTab com isLoading)
- [x] Adicionar animação shimmer ao skeleton (keyframe shimmer em index.css)
- [x] Adicionar procedures backend (getPhotos, uploadPhoto, deletePhoto)
- [x] Adicionar tab de Fotos na página PlantDetail
- [x] Criar página de demonstração (/skeleton-demo)
- [x] Testar animação no navegador - funcionando perfeitamente

## Ajustes de Design (19/02/2026)

- [x] Remover aba de Fotos da página PlantDetail (removida - desnecessária)
- [x] Redesenhar PlantLSTTab com layout horizontal em colunas
- [x] Adicionar ícones à esquerda dos itens LST (emoji grande + nome + badge + descrição)
- [x] Testar novo design no navegador - layout horizontal funcionando perfeitamente

## Ajustes Calculadora PPFD e Média de Parâmetros (19/02/2026)

- [x] Redesenhar calculadora PPFD com slider mais alto (h-10) e thumb maior (w-14 h-14 com borda cinza + stroke branco)
- [x] Implementar cálculo de média de parâmetros ideais para estufas com múltiplas strains (já implementado no backend - getTargetsByTent)
- [x] Mostrar valores médios no card da estufa quando tem múltiplas strains ("📊 Parâmetros médios (2 strains)" na Estufa A)
- [x] Testar ambas as funcionalidades no navegador - funcionando perfeitamente


## 🔴 Bugs Críticos Identificados na Revisão (19/02/2026)

- [x] Bug: Semana inconsistente na página Tasks - Estufas A e B mostram "Semana do ciclo" sem número (Estufa C mostra corretamente)
- [x] Bug: Input de arquivo oculto na página Configurações - campo de seleção não está visível, impedindo importação de backup
- [x] Adicionar feedback de sucesso/erro em operações de backup (toasts de confirmação)


## 🟠 Melhorias de Alta Prioridade (19/02/2026)

- [x] Ocultar atalhos de teclado em mobile (Configurações) - usuários mobile não usam teclado físico
- [x] Adicionar filtros na página Tasks - por estufa específica (Todas/A/B/C) e toggle "Apenas pendentes"
- [x] Converter tabela de Strains para cards em mobile - layout responsivo com cards ao invés de tabela horizontal


### 🎯 Melhorias de UX em Andamento (19/02/2026)

- [x] Implementar acordeão na aba "Gerenciar" (Tasks) - agrupar 40 templates por categoria (Manutenção, Vegetativa, Floração) com seções colasáveis para reduzir scroll de 2809px


## 📋 Criar Página de Gerenciamento de Tarefas (19/02/2026)

- [x] Criar nova página "Tarefas" no menu lateral
- [x] Integrar TaskTemplatesManager na nova página
- [x] Adicionar rota no App.tsx
- [x] Adicionar item no menu lateral (Sidebar desktop)
- [x] Adicionar item no menu "Mais" (BottomNav mobile)


## 🔴 Melhorias Urgentes de UX (19/02/2026)

- [x] Adicionar busca em Strains (ManageStrains.tsx) - campo de busca por nome/descrição
- [x] Adicionar busca na página Tarefas (TaskTemplatesManager) - campo de busca por título/descrição
- [x] Implementar botão "Ocultar concluídas" na Home - toggle para minimizar tarefas já marcadas
- [x] Adicionar seção de Configurações de Alertas (Settings.tsx) - UI para configurar notificações

## 🎯 Melhorias de Organização (19/02/2026)

- [x] Ajustar nomes de categorias de templates de tarefas para serem genéricos (sem mencionar estufas específicas)
- [x] Implementar tabs por estufa na página Histórico (Todas | Estufa A | Estufa B | Estufa C)


## 🔧 Ajuste de Nomenclatura (19/02/2026)

- [x] Identificar onde templates de tarefas são criados (seed data/migrations)
- [x] Ajustar nomes de categorias: "Vegetativo - Estufas B/C" → "Tarefas de Vegetação"
- [x] Ajustar nomes de categorias: "Floração - Estufas B/C" → "Tarefas de Floração"
- [x] Ajustar nomes de categorias: "Manutenção - Estufa A" → "Tarefas de Manutenção"
- [x] Atualizar frontend (TaskTemplatesManager) para exibir novos nomes


## 🔔 Configurações de Alertas (19/02/2026)

- [x] Criar componente AlertSettings com toggles para cada tipo de alerta
- [x] Adicionar inputs para thresholds personalizados (temperatura, pH, umidade, PPFD)
- [x] Integrar AlertSettings na página Settings
- [ ] Implementar salvamento de preferências de alertas no backend (TODO: tRPC procedure)
- [x] Testar configurações e validação de inputs


## 🔄 Reorganização de Alertas (19/02/2026)

- [x] Transformar página Alertas em histórico de notificações (últimos 50 alertas)
- [x] Remover seção de configurações da página Alertas
- [x] Manter Configurações de Alertas apenas em Settings
- [x] Testar nova organização


## 🐛 Correção de Bug (19/02/2026)

- [x] Corrigir erro de botão aninhado na página Home
- [x] Corrigir padding excessivo no preview das calculadoras em mobile

## 💾 Backend de Preferências de Alertas (19/02/2026)

- [x] Criar schema de preferências de alertas no banco de dados
- [ ] Aplicar migration com pnpm db:push (pendente - requer confirmações manuais)
- [ ] Implementar tRPC procedures para salvar preferências
- [ ] Implementar tRPC procedures para carregar preferências
- [ ] Integrar backend com componente AlertSettings
- [ ] Testar salvamento e carregamento de preferências
