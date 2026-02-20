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


## 🎯 Colapso Automático de Tarefas (19/02/2026)

- [ ] Implementar lógica de colapso automático ao marcar tarefa como concluída
- [ ] Adicionar animação suave de colapso
- [ ] Testar funcionalidade em todas as estufas


## 🎯 Colapso Automático de Tarefas (19/02/2026)

- [x] Implementar lógica de colapso automático ao marcar tarefa como concluída
- [x] Adicionar animação suave de colapso (transição CSS)
- [x] Testar funcionalidade em diferentes estufas


## 🐛 Bug - Botão "Ocultar concluídas" não funciona (19/02/2026)

- [x] Investigar por que botão "Ocultar concluídas" não mostra/oculta tarefas marcadas
- [x] Corrigir lógica de filtragem de tarefas concluídas (linha 586 Home.tsx)
- [x] Testar funcionalidade do botão - funcionando perfeitamente

## 🔍 Busca em Strains e Tarefas (19/02/2026)

- [x] Adicionar campo de busca na página ManageStrains (filtrar por nome ou descrição) - já estava implementado
- [x] Adicionar campo de busca no TaskTemplatesManager (filtrar por título ou descrição) - já estava implementado
- [x] Testar funcionalidade de busca em ambas as páginas - funcionando perfeitamente


## 📱 Swipe Gestures no Lightbox Mobile (19/02/2026)

- [x] Analisar componente Lightbox atual (PlantHealthTab.tsx e PlantPhotosTab.tsx)
- [x] Implementar touch event handlers (touchstart, touchmove, touchend)
- [x] Adicionar feedback visual durante o swipe (transform translateX com transição suave)
- [x] Adicionar threshold de swipe (mínimo 50px para trocar foto)
- [x] Testar implementação no navegador - lightbox abre corretamente
- [x] Implementar swipe gestures em PlantHealthTab.tsx (linhas 93-96, 622-653, 661-677)
- [x] Implementar swipe gestures em PlantPhotosTab.tsx (linhas 18-21, 107-137, 250-259)


## 🔔 Sistema de Alertas Inteligentes com Valores Ideais das Strains (19/02/2026)

- [ ] Analisar schema atual de alertSettings e weeklyTargets
- [ ] Atualizar schema alertSettings para incluir margens de erro (tempMargin, rhMargin, phMargin, ppfdMargin)
- [ ] Implementar backend procedure para calcular valores ideais por estufa (getIdealValuesByTent)
- [ ] Calcular média dos valores ideais quando estufa tem múltiplas strains
- [ ] Atualizar UI de AlertSettings para mostrar valores ideais automáticos
- [ ] Adicionar campos de margem de erro configuráveis (±2°C, ±5% RH, ±0.2 pH, ±50 PPFD)
- [ ] Implementar lógica de alertas contextuais com valores ideais + margem
- [ ] Testar sistema completo com diferentes configurações de estufas


## 🏗️ Refatoração: Estufas Dinâmicas (Número Ilimitado) (19/02/2026)

- [ ] Analisar impacto da remoção do enum tentType (A, B, C fixos)
- [ ] Atualizar schema: remover tentType enum, adicionar campo category (Manutenção, Vegetativo, Floração)
- [ ] Atualizar seed data para usar novo formato
- [ ] Atualizar backend procedures (getAll, create, update, delete)
- [ ] Atualizar Home.tsx para renderizar estufas dinamicamente do banco
- [ ] Implementar funcionalidade do botão "Criar Nova Estufa"
- [ ] Atualizar TentDetails.tsx para trabalhar com IDs dinâmicos
- [ ] Testar criação, edição e exclusão de estufas
- [ ] Verificar impacto em alertas, tarefas e histórico


## 🏗️ Refatoração: Estufas Dinâmicas com Categorias Selecionáveis (19/02/2026)

- [x] Remover enum tentType (A, B, C) do schema
- [x] Adicionar campo category enum (MAINTENANCE, VEGA, FLORA, DRYING) selecionável
- [x] Adicionar fase DRYING (2 semanas) em weeklyTargets, taskTemplates, safetyLimits
- [x] Manter campo name como texto livre para nome customizável
- [x] Adicionar updatedAt em tabela tents
- [ ] Aplicar migration do schema (pnpm db:push)
- [ ] Atualizar seed data para novo formato
- [ ] Atualizar backend procedures (tents.getAll, create, update, delete)
- [ ] Atualizar Home.tsx para renderizar estufas dinamicamente
- [ ] Implementar modal "Criar Nova Estufa" com seletor de categoria
- [ ] Atualizar lógica de tarefas para usar category ao invés de tentType
- [ ] Testar criação de múltiplas estufas da mesma categoria


## 🔔 Alertas Inteligentes por Estufa com Valores Ideais (19/02/2026)

- [x] Manter tentId em alertSettings (configuração individual por estufa)
- [x] Adicionar margens de erro configuráveis (tempMargin, rhMargin, ppfdMargin, phMargin)
- [x] Adicionar phEnabled toggle
- [ ] Aplicar migration do schema (pnpm db:push)
- [ ] Criar procedure getIdealValuesByTent(tentId) que retorna valores ideais da strain/semana
- [ ] Calcular média quando estufa tem múltiplas strains
- [ ] Lógica de alertas: valor real vs (ideal ± margem da estufa)
- [ ] Atualizar UI de AlertSettings para mostrar configuração por estufa
- [ ] Mostrar valores ideais atuais da estufa na UI como referência
- [ ] Testar alertas contextuais: "Estufa B: Temp 28°C acima do ideal 24°C (±2°C)"


## 🏗️ Implementar Modal "Criar Nova Estufa" (19/02/2026)

- [x] Corrigir erros TypeScript (tentType → category) em Alerts.tsx, Home.tsx, db.ts, routers.ts
- [x] Aplicar migration do schema (script customizado apply-migration.mjs)
- [x] Criar backend procedure tents.create com validação (já existia, atualizado para category)
- [x] Implementar modal com formulário (nome, category select, dimensões, potência)
- [x] Adicionar validação de campos obrigatórios (HTML5 + Zod backend)
- [x] Atualizar Home.tsx para renderizar estufas dinamicamente do banco
- [x] Corrigir erro de botão aninhado em "Tarefas da Semana"
- [x] Testar criação de múltiplas estufas - "Estufa Teste 4" criada com sucesso
- [ ] Implementar edição de estufas (modal de edição)
- [ ] Implementar exclusão de estufas (confirmação + cascade delete)


## 📊 Filtro por Estufa no Histórico (19/02/2026)

- [x] Analisar componente HistoryTable - filtro já estava implementado
- [x] Tabs no topo da página (Todas + estufas dinâmicas) - já implementado
- [x] Estado de filtro selecionado (selectedTentId) - já implementado
- [x] Query dailyLogs.listAll filtra por tentId - já implementado
- [x] Gráficos de análise aparecem quando estufa específica é selecionada
- [x] Testar filtro com Estufa B - funcionando perfeitamente (14 registros filtrados)

## 🍂 Tarefas de Secagem (19/02/2026)

- [ ] Pesquisar na web tarefas típicas durante secagem (2 semanas)
- [ ] Adicionar taskTemplates para fase DRYING
- [ ] Incluir tarefas como: controle temperatura/umidade, verificação de mofo, teste de secagem
- [ ] Adicionar weeklyTargets para DRYING (temperatura ideal, umidade ideal)

## 🐛 Correção de Botão Aninhado na Home (19/02/2026)

- [x] Corrigir erro de botão aninhado em "Tarefas da Semana" (transformado em div com botões separados)
- [x] Testar criação de estufa após correção - funcionando perfeitamente


## 📱 Reduzir Padding dos Cards de Calculadoras Mobile (19/02/2026)

- [x] Analisar componente CalculatorMenu.tsx para identificar padding excessivo
- [x] Reduzir padding interno dos cards (p-4 md:p-6 ao invés de p-6)
- [x] Ajustar espaçamentos entre cards (gap-3 md:gap-4)
- [x] Otimizar tamanho de ícones (w-10 h-10 md:w-16 md:h-16) e texto (text-lg md:text-xl)
- [x] Reduzir margens do container (px-3 py-4 md:px-4 md:py-8)
- [x] Testar visualização - layout muito mais otimizado para mobile


## 🎨 Atualizar Favicon para Símbolo do App (19/02/2026)

- [x] Localizar favicon atual (client/public/favicon.svg)
- [x] Criar novo favicon com ícone Leaf (mesmo do menu lateral)
- [x] Substituir favicon.svg no projeto
- [x] Testar visualização na aba do navegador - funcionando perfeitamente


## 🍂 Implementar Fase DRYING nos Ciclos (19/02/2026)

- [x] Pesquisar tarefas típicas de secagem na web (Leafly + guias brasileiros)
- [x] Criar weeklyTargets para DRYING (18-20°C, 55-60% RH, 0 PPFD, pH N/A)
- [x] Criar 20 taskTemplates para 2 semanas de secagem (verificações diárias)
- [x] Adicionar DRYING nos enums de phase em routers.ts e EditCycleModal.tsx
- [x] Testar fase DRYING - aparece como "🍂 Secagem (2 semanas)" no select


## 🐛 Corrigir Estado Padrão do Botão "Ocultar Concluídas" (19/02/2026)

- [x] Localizar estado hideCompleted em Home.tsx (linha 377)
- [x] Estado padrão já estava correto (`false` - mostrar todas)
- [x] Remover animação CSS conflitante que ocultava tarefas concluídas (linhas 608-611)
- [x] Testar comportamento - todas as tarefas visíveis por padrão, botão funciona corretamente


## 🔔 Sistema de Alertas Inteligentes com Margens Automáticas (19/02/2026)

- [x] Analisar estrutura atual de alertas (alertSettings, procedures existentes)
- [x] Criar função getIdealValuesByTent em db.ts (calcula fase/semana baseado em categoria e datas)
- [x] Adicionar procedure alerts.getIdealValues no backend (routers.ts)
- [x] Adicionar DRYING na assinatura de getWeeklyTarget
- [x] Calcular média de valores ideais quando estufa tem múltiplas strains (lógica implementada)
- [x] Adicionar pH ao enum metric da tabela alerts
- [ ] REFATORAÇÃO: Criar tabela phaseAlertMargins (phase, tempMargin, rhMargin, ppfdMargin, phMargin)
- [ ] Seed com valores padrão por fase:
  - MAINTENANCE: ±3°C, ±10%, ±100, ±0.3
  - CLONING: ±2°C, ±5%, ±50, ±0.2
  - VEGA: ±2°C, ±5%, ±50, ±0.2
  - FLORA: ±2°C, ±5%, ±50, ±0.2
  - DRYING: ±1°C, ±3%, 0, N/A (controle rigoroso!)
- [ ] Implementar checkAlertsForTent usando margens da fase atual da estufa
- [ ] Criar procedures backend para CRUD de margens por fase
- [ ] Atualizar UI de AlertSettings para mostrar/editar margens por fase (5 seções)
- [ ] Testar sistema completo com diferentes fases
- [ ] Criar mensagens contextuais: "Estufa B (Flora S4): Temp 28°C acima do ideal 24°C (±2°C) - Candy Kush"


## 🚨 L\u00f3gica de Alertas Contextuais (19/02/2026)

- [ ] Analisar schema da tabela `alerts` (campos, tipos, severidade)
- [ ] Criar fun\u00e7\u00e3o checkAlertsForTent que:
  - Busca \u00faltimo dailyLog da estufa
  - Busca valores ideais via getIdealValuesByTent
  - Busca margens configuradas em alertSettings
  - Compara cada par\u00e2metro (temp, RH, PPFD, pH) com ideal \u00b1 margem
  - Gera alertas quando valor sai da faixa aceit\u00e1vel
- [ ] Criar procedure alerts.checkAll para verificar todas as estufas
- [ ] Implementar gera\u00e7\u00e3o de mensagens contextuais:
  - "Estufa B: Temp 28\u00b0C acima do ideal 24\u00b0C (\u00b12\u00b0C) para Candy Kush S4"
  - "Estufa A: Umidade 45% abaixo do ideal 60% (\u00b15%) - M\u00e9dia de 2 strains"
- [ ] Salvar alertas no banco com timestamp, severidade (warning/critical)
- [ ] Criar job autom\u00e1tico para executar checkAll a cada 1 hora
- [ ] Testar sistema completo com diferentes cen\u00e1rios

## Sistema de Alertas Inteligentes com Margens por Fase

- [x] Criar tabela phaseAlertMargins no schema (margens configuráveis por fase: MAINTENANCE, CLONING, VEGA, FLORA, DRYING)
- [x] Aplicar migration SQL para criar tabela phaseAlertMargins
- [x] Popular tabela com valores padrão (MAINTENANCE: ±3°C/±10%RH, CLONING: ±2°C/±5%RH, VEGA: ±2°C/±5%RH, FLORA: ±2°C/±5%RH, DRYING: ±1°C/±3%RH)
- [x] Implementar função getIdealValuesByTent no backend (calcula valores ideais baseados na strain/semana ativa, com média para múltiplas strains)
- [x] Criar procedure tRPC alerts.getIdealValues
- [x] Implementar função checkAlertsForTent no backend (compara valores reais vs ideais com margens da fase, gera mensagens contextuais)
- [x] Criar procedure tRPC alerts.checkAlerts
- [x] Adicionar DRYING ao enum de phase em taskTemplates e recipeTemplates
- [x] Aplicar migration SQL para adicionar DRYING ao enum
- [x] Corrigir referências de tentType para category no frontend (TentLog.tsx, TentDetails.tsx, PlantDetail.tsx)
- [x] Corrigir referências de dailyLogs.date para dailyLogs.logDate
- [x] Corrigir referências de cloningEvents.date para cloningEvents.startDate
- [x] Corrigir referências de taskInstances.dueDate para taskInstances.occurrenceDate
- [x] Corrigir chamadas de funções antigas (getActiveCycles, getHistoricalDataWithTargets)
- [ ] Atualizar UI de AlertSettings para mostrar margens por fase (5 seções: MAINTENANCE, CLONING, VEGA, FLORA, DRYING)
- [ ] Testar sistema completo de alertas com margens por fase

## UI de Configuração de Alertas por Fase

- [x] Criar procedures tRPC para gerenciar phaseAlertMargins (getAll, update)
- [x] Atualizar componente AlertSettings para mostrar 5 seções (MAINTENANCE, CLONING, VEGA, FLORA, DRYING)
- [x] Adicionar inputs editáveis para margens (tempMargin, rhMargin, ppfdMargin, phMargin)
- [x] Implementar salvamento de configurações por fas- [x] Testar fluxo completo de geração de receitas

## Verificação Automática de Alertas (Cron Job)

- [x] Criar arquivo `server/cron/alertsChecker.ts` com lógica de verificação automática
- [x] Implementar função `checkAllTentsAlerts()` que busca todas as estufas ativas e executa `checkAlertsForTent()`
- [x] Configurar cron job para executar a cada 1 hora
- [x] Adicionar procedure tRPC `alerts.checkAllTents` para verificação manual
- [x] Adicionar logs de execução do cron job
- [x] Testar execução automática e manual do cron job

## Sistema de Notificações Push

- [x] Criar tabela `notificationSettings` para configurações de notificações do usuário
- [x] Implementar função `sendPushNotification()` usando helper do Manus
- [x] Integrar envio de notificações no `checkAlertsForTent()` quando alertas críticos forem detectados
- [x] Criar procedures tRPC para gerenciar configurações de notificações (get, update)
- [x] Implementar UI de configurações de notificações (habilitar/desabilitar por tipo de alerta)
- [x] Adicionar toggle para notificações na página de Alertas
- [x] Testar fluxo completo de notificações push

## Correções Urgentes

- [x] Remover autenticação de notificationSettings (mudar de protectedProcedure para publicProcedure)
- [x] Adicionar ícones para todas as fases (MAINTENANCE, CLONING, VEGA, FLORA) - DRYING já tem
- [x] Corrigir salvamento da fase DRYING - estufa não está salvando corretamente
- [x] Revisar tarefas de secagem - tarefas de VEGA estão aparecendo quando deveria ser DRYING
- [x] Testar fluxo completo de mudança de fase para DRYING

## Templates de Tarefas de Secagem (DRYING)

- [x] Criar template "Controle de Ambiente" - Monitoramento diário de temperatura/umidade
- [x] Criar template "Inspeção de Mofo" - Verificação visual de fungos/bactérias
- [x] Criar template "Teste de Cura (Snap Test)" - Avaliação do ponto de secagem
- [x] Criar template "Rotação de Material" - Movimentação para secagem uniforme
- [x] Criar template "Preparação para Armazenamento" - Limpeza e trimming final
- [x] Testar visualização das tarefas de DRYING na UI

## Sistema de Receitas de Nutrientes

### Schema de Banco de Dados
- [x] Criar tabela `recipeTemplates` (nome, fase, weekNumber, NPK, micronutrientes, pH target, EC target)
- [x] Criar tabela `nutrientApplications` (histórico de aplicações por estufa/ciclo)
- [x] Aplicar migrations no banco de dados

### Backend - Cálculos Automáticos
- [x] Implementar função `calculateNutrientMix()` - cálculo de NPK, Ca, Mg, Fe
- [x] Implementar função `convertPPMtoEC()` e `convertECtoPPM()`
- [x] Implementar função `calculatepHAdjustment()` - quantidade de pH up/down
- [x] Criar procedures tRPC para recipeTemplates (getAll, getByPhase, create)
- [x] Criar procedures tRPC para nutrientApplications (create, getByTent, getHistory)

### Frontend - UI de Receitas
- [ ] Criar componente `NutrientRecipeSelector` - seleção de receita base por fase
- [ ] Criar componente `NutrientCalculator` - ajuste de quantidades e cálculos em tempo real
- [ ] Criar componente `NutrientHistory` - histórico de aplicações por estufa
- [ ] Integrar com página de Fertilização existente

### Templates de Receitas Pré-configuradas
- [x] Criar receita "Clonagem Básica" (fase CLONING)
- [x] Criar receitas "Vega Semana 1-4" (fase VEGA, intensidade crescente)
- [x] Criar receitas "Flora Semana 1-8" (fase FLORA, boost de P-K)
- [x] Criar receita "Flush Final" (fase DRYING, apenas água)

### Testes
- [x] Criar teste vitest para cálculos de nutrientes
- [x] Criar teste vitest para conversões PPM↔EC
- [x] Testar fluxo completo de seleção e aplicação de receita

## UI de Receitas de Nutrientes

### Componente NutrientRecipeSelector
- [x] Criar seletor de fase (CLONING, VEGA, FLORA, MAINTENANCE, DRYING)
- [x] Criar seletor de semana (quando aplicável)
- [x] Listar receitas disponíveis via tRPC
- [x] Carregar receita selecionada no editor

### Componente NutrientCalculator
- [x] Criar inputs editáveis para volume total (L)
- [x] Criar lista de produtos com inputs de quantidade (ml)
- [x] Adicionar/remover produtos dinamicamente
- [x] Calcular NPK total em tempo real
- [x] Calcular micronutrientes (Ca, Mg, Fe) em tempo real
- [x] Calcular EC estimado e mostrar conversão PPM↔EC
- [x] Calcular pH estimado e mostrar ajuste necessário (pH Up/Down)
- [x] Botão para salvar aplicação (registrar no histórico)

### Componente NutrientHistory
- [x] Listar aplicações anteriores por estufa
- [x] Filtro por estufa e ciclo
- [x] Mostrar detalhes de cada aplicação (data, receita, EC/pH real vs target)
- [ ] Gráfico de evolução de EC/pH ao longo do tempo (opcional para próxima iteração)

### Integração
- [x] Adicionar rota /nutrients na navegação
- [x] Criar página Nutrients.tsx com todos os componentes
- [x] Testar fluxo completo de seleção, ajuste e salvamento

## Revisão Completa do App

### Mapeamento de Páginas e Funcionalidades
- [ ] Listar todas as rotas existentes no App.tsx
- [ ] Mapear componentes de página em client/src/pages/
- [ ] Identificar procedures tRPC no backend (server/routers.ts)
- [ ] Documentar fluxo de navegação atual

### Revisão de Páginas Específicas
- [ ] Revisar Strains (lista, detalhes, formulários)
- [ ] Revisar Tasks (lista de tarefas, checkboxes, filtros)
- [ ] Revisar Configurações (formulários, seções, organização)

### Identificação de Código Não Utilizado
- [ ] Identificar páginas/rotas não acessíveis pela navegação
- [ ] Identificar procedures tRPC não utilizados no frontend
- [ ] Identificar componentes duplicados ou redundantes
- [ ] Identificar imports não utilizados

### Melhorias de UX/UI
- [ ] Revisar consistência visual entre páginas
- [ ] Identificar fluxos de navegação confusos
- [ ] Sugerir melhorias de responsividade mobile
- [ ] Propor simplificações de formulários complexos
- [ ] Revisar feedback visual (loading states, toasts, erros)

### Implementação de Melhorias
- [ ] Remover código não utilizado
- [ ] Implementar melhorias de UX/UI aprovadas
- [ ] Atualizar navegação e rotas
- [ ] Testar fluxos principais após mudanças

## Unificação de Design - Nutrientes + Calculadora de Fertilização

- [x] Analisar design da calculadora de fertilização (cores, layout, apresentação)
- [x] Analisar design atual da página Nutrientes
- [x] Criar design unificado combinando melhores elementos de ambos
- [x] Implementar novo design na página Nutrientes
- [x] Remover calculadora de fertilização do menu de calculadoras
- [x] Testar design unificado em diferentes viewports

## Widget de Alertas na Home

- [x] Criar componente AlertsWidget.tsx
- [x] Implementar lógica de contagem de alertas por estufa (NEW + SEEN)
- [x] Adicionar badges coloridos (verde: 0 alertas, amarelo: 1-3 alertas, vermelho: 4+ alertas)
- [x] Mostrar tipos de alertas (temperatura, umidade, PPFD, pH)
- [x] Adicionar link para página de alertas ao clicar no card
- [x] Integrar AlertsWidget na página Home
- [x] Testar widget com diferentes cenários de alertas

## Refatoração da Página de Nutrientes

- [ ] Redesenhar UI com foco em volume como input principal
- [ ] Criar campo gigante "Quantos litros você vai preparar?" no topo
- [ ] Adicionar botão "Gerar Receita" grande e verde
- [ ] Implementar cálculo automático de quantidades (ml/g) baseado em volume
- [ ] Mostrar resultado com cards coloridos de produtos e quantidades
- [ ] Adicionar seção "Ajustes Avançados" colapsada (Accordion)
- [ ] Mover edição de produtos/NPK para seção avançada
- [ ] Testar fluxo completo: selecionar fase → inserir volume → gerar receita

## Reversão da Página de Nutrientes para Calculadora Simplificada

- [ ] Reverter Nutrients.tsx para calculadora antiga (sem templates, sem edição de produtos)
- [ ] Remover seletor de receitas pré-configuradas
- [ ] Remover editor de produtos (quantidades são calculadas automaticamente)
- [ ] Manter apenas: Fase + Semana + Volume → Receita calculada
- [ ] Implementar salvamento de receita apenas para histórico (não como predefinição)
- [ ] Testar fluxo completo: selecionar fase/semana, digitar volume, ver receita, salvar

## Adaptação para Sais Minerais Sólidos

- [ ] Atualizar função `getRecommendedRecipe()` para usar sais minerais em gramas
- [ ] Criar produtos: Nitrato de Cálcio, Nitrato de Potássio, MKP, Sulfato de Magnésio, Micronutrientes
- [ ] Ajustar cálculos de NPK baseados em composição química dos sais
- [ ] Atualizar página Nutrients.tsx para mostrar quantidades em gramas (g) ao invés de ml
- [ ] Corrigir fórmula de EC para valores realistas (1.2-1.6 mS/cm para Vega)
- [ ] Testar cálculos com diferentes volumes e fases

## Histórico de Nutrientes (19/02/2026)

- [x] Criar procedure tRPC para listar aplicações de nutrientes com filtros
- [x] Implementar UI da aba Histórico com cards de receitas
- [x] Adicionar filtros por estufa e fase
- [ ] Implementar botão "Reutilizar Receita" para carregar receita salva
- [ ] Testar fluxo completo de salvar e reutilizar receitas

## Histórico de Rega (19/02/2026)

- [x] Criar tabela wateringApplications no banco de dados
- [x] Criar procedures backend para salvar e listar aplicações de rega
- [x] Implementar botão Salvar Receita na calculadora de rega
- [x] Implementar aba Histórico na calculadora de rega
- [ ] Testar funcionalidade completa

## Melhorias de UX (19/02/2026)

- [x] Adicionar accordion no histórico de nutrientes para compactar
- [x] Remover "Nutrientes" do menu e mover para dentro de "Calculadoras"
- [x] Reduzir padding das calculadoras no mobile
- [x] Remover predefinições da calculadora de rega (deixar só histórico)

## Correção de Navegação (19/02/2026)

- [x] Remover submenu do sidebar (voltar menu simples)
- [x] Adicionar card de Fertilização na página de Calculadoras

## Ajustes Finais (19/02/2026)

- [x] Corrigir tamanho desproporcional do número no campo de litros da fertilização
- [x] Revisão geral: testar todas as funcionalidades no desktop
- [x] Revisão geral: testar mobile e dark mode
- [x] Analisar e limpar código que não funciona

## Tarefas Futuras

- [ ] Revisar README
- [ ] Criar guia de usuário
- [ ] Criar guia de instalação

## Correção Home
- [x] Reduzir padding dos cards de calculadoras no mobile

- [x] Restaurar exibição do número de plantas na home

## Revisão de Documentação e Código

- [ ] Listar e analisar todos os arquivos de código e documentação
- [ ] Identificar e remover arquivos não utilizados
- [ ] Revisar e atualizar README.md com funcionalidades atuais
- [ ] Revisar e atualizar manual de instalação

## Consolidação de Documentação

- [x] Criar README.md consolidado com visão geral do projeto
- [x] Criar INSTALACAO.md unificado com todas as plataformas
- [x] Criar DEPLOY.md com guias de deploy
- [x] Criar GUIA-USUARIO.md atualizado com todas as funcionalidades
- [x] Remover arquivos markdown duplicados

## Bateria Completa de Testes

- [x] Testar sistema de alertas (criação automática e visualização)
- [x] Testar configurações de alertas por estufa
- [x] Testar gerenciamento de strains
- [ ] Testar tarefas semanais
- [ ] Testar fluxo completo: estufa → ciclo → logs → gráficos
- [ ] Testar fluxo completo: planta → fotos → saúde → mover
- [ ] Testar edge cases e validações
- [x] Documentar resultados dos testes

## Cards ocuparem largura completa no mobile
- [x] Remover width: 333px fixo dos cards
- [x] Adicionar w-full para cards ocuparem 100% da largura disponível
- [ ] Testar no mobile para confirmar

## Melhorar diagramação interna dos cards
- [x] Ajustar padding e espaçamento entre elementos
- [x] Melhorar hierarquia visual (tamanhos de fonte, pesos)
- [x] Garantir alinhamento consistente
- [ ] Testar resultado final

## Verificar botão voltar em todas calculadoras
- [x] Verificado - Todas calculadoras usam o mesmo header com botão ArrowLeft (linhas 160-165)
- [x] Botão voltar funciona e redireciona para /calculators

## Adicionar padding interno geral nos cards
- [x] Adicionar padding uniforme no Card (p-5 md:p-6) para centralizar conteúdo
- [ ] Testar visualmente


## Melhorias Prioritárias da Auditoria (20/02/2026)

- [x] Implementar animações de entrada nos cards de calculadoras (fade-in escalonado com delay 100ms)
- [x] Adicionar sistema de toasts para feedback visual (sucesso/erro após ações) - Já implementado com Sonner em 13 páginas
- [x] Criar empty states para páginas sem dados (componente EmptyState criado)
- [x] Adicionar badges "Novo" e "Popular" nas calculadoras (Rega e Fertilização = Popular, pH = Novo)
- [ ] Implementar loading states em botões durante operações assíncronas

## Implementar EmptyState nas páginas principais
- [x] Adicionar EmptyState na página de Plantas quando não houver plantas cadastradas
- [x] Adicionar EmptyState na página de Histórico quando não houver registros
- [x] Adicionar EmptyState na página de Alertas quando não houver alertas ativos

## Correções de Dark Mode e Layout Desktop (20/02/2026)
- [x] Corrigir contraste do texto "Litros" no dark mode (text-muted-foreground → text-foreground)
- [x] Corrigir cores dos cards NPK para dark mode (bg-color-500/10 dark:bg-color-500/20, text-color-600 dark:text-color-400)
- [x] Corrigir cores dos cards Micronutrientes para dark mode (mesma estratégia de cores adaptativas)
- [x] Corrigir cor do card EC Estimado para dark mode
- [x] Melhorar layout desktop da calculadora de fertilização (grid 2 colunas lg:grid-cols-2 para inputs)

## Implementar Loading Skeletons (20/02/2026)
- [x] Criar componente reutilizável de skeleton para listas (ListSkeletons.tsx)
- [x] Implementar skeleton na página de Plantas (PlantsList) - PlantListSkeleton
- [x] Implementar skeleton na página de Histórico (HistoryTable) - HistoryTableSkeleton
- [x] Implementar skeleton na página de Tarefas (Tasks) - TaskCardSkeleton

## Implementar Loading States em Botões Assíncronos (20/02/2026)
- [x] Adicionar loading state no botão de salvar receita (Nutrients page) - "Salvando..."
- [x] Botão de mover plantas (PlantsList) - já tinha "Movendo..."
- [x] Melhorar botão de exclusão (HistoryTable) - "Excluindo..." com texto
- [x] Adicionar loading state em transplantar planta (PlantDetail) - "Transplantando..."
- [x] Adicionar loading state em marcar como colhida (PlantDetail) - "Salvando..."
- [x] Adicionar loading state em excluir estufa (Home) - "Excluindo..."
- [x] Botão de criar planta (NewPlant) - já tinha "Criando..."
- [x] Botão de salvar registro (TentLog) - já tinha "Salvando..."

## Implementar Funcionalidade de Desfazer Exclusões (20/02/2026)
- [x] Implementar undo para exclusão de registros diários (HistoryTable) - 5s grace period
- [x] Implementar undo para exclusão de estufas (Home) - 5s grace period
- [x] Implementar undo para exclusão de strains (Strains page) - 5s grace period
- [x] Implementar undo para exclusão de strains (ManageStrains page) - 5s grace period
- [x] Adicionar toast com botão "Desfazer" e timer de 5 segundos usando Sonner
- [x] Plantas não têm funcionalidade de exclusão (apenas harvest/transplant)

## Corrigir Testes Falhando (20/02/2026)
- [x] Corrigir testes de daily logs - criar tent com campos obrigatórios (category, width, depth, height)
- [x] Corrigir testes de nutrientes - trocar amountMl por amountG (sais minerais sólidos)
- [x] Corrigir testes de cycles - criar tent e strain com nomes únicos (timestamp)
- [x] Corrigir teste de plantHealth - buscar strain após criação para obter ID
- [x] Todos os 80 testes passando com sucesso! 🎉

## Adicionar botão de voltar (20/02/2026)
- [x] Adicionar botão de voltar na página de Nutrientes/Fertilização

## Adicionar Breadcrumb Navigation (20/02/2026)
- [x] Criar componente Breadcrumb reutilizável
- [x] Adicionar breadcrumb na página de Nutrientes/Fertilização (Home > Calculadoras > Fertilização)

## Bugs e Melhorias Reportados - Teste de Usuário (20/02/2026)

### Bugs Críticos
- [x] Botão de download não funciona nas imagens de planta e tricoma - Corrigido CORS (link direto)
- [x] Adicionar nova tarefa - Sistema cria automaticamente via templates (funcionando corretamente)
- [ ] Registros diários não funcionam na página de histórico - Precisa mais detalhes do usuário
- [x] Não é possível excluir strain - Adicionada validação de dependências (ciclos/plantas)
- [x] Erro ao criar strains - Adicionada validação de nome duplicado

### Funcionalidades Faltando
- [ ] Opção de excluir planta (além de marcar como colhida)
- [ ] Opção de retirar planta caso fique doente (sem ser colheita normal)
- [x] Poder excluir tarefas - Botão de lixeira adicionado em cada tarefa

### Melhorias de UX/Design
- [ ] Traduzir "Maintenance" e verificar possíveis erros de tradução (app é em português)
- [ ] Adicionar cor roxa faltando em tricomas
- [ ] Porcentagem de tricomas não aparece no mobile - verificar design
- [ ] Aumentar botão/slider PPFD para melhor usabilidade (bolinha muito pequena)
- [ ] Remover zero à esquerda na calculadora de fertilização
- [ ] Design das cores da calculadora: usar uma cor diferente por elemento (não tudo verde)
- [ ] Melhorar visualização da página de histórico no mobile com mais de 3 estufas

## Implementar Melhorias UX Mobile (20/02/2026)
- [x] Traduzir "Maintenance" para "Manutenção" em todo o app (já estava traduzido em Home, adicionado em Alerts)
- [x] Adicionar opção de cor roxa (purple) em tricomas - Já existe (Misto)
- [x] Corrigir exibição de porcentagem de tricomas no mobile - Aumentado tamanho e contraste
- [x] Aumentar tamanho do slider PPFD - Convertido para slider com thumb 6x6 (24px)
- [x] Remover zero à esquerda no input de volume da calculadora de fertilização - parseInt remove automaticamente

## Implementar Funcionalidade de Excluir Planta (20/02/2026)
- [x] Adicionar endpoint de exclusão de planta no backend (plants.delete com cascade)
- [x] Adicionar botão de excluir no menu de ações da planta (PlantDetail)
- [x] Adicionar toast com undo de 5 segundos antes de excluir
- [ ] Testar exclusão de planta

## Corrigir Bug de Criação de Registros Diários (20/02/2026)
- [x] Investigar por que não consegue criar registros a partir da página de histórico - Faltava botão
- [x] Adicionar botão "Novo Registro" que redireciona para /tent-log
