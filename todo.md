# App Cultivo - Lista de Melhorias

## 📊 Calculadoras (Novas/Melhorias)

### Calculadora de Runoff
- [x] Criar página de calculadora de runoff
- [x] Calcular % de runoff ideal baseado em fase e substrato
- [x] Calcular volume de saída esperado baseado em volume de entrada
- [x] Adicionar dicas de interpretação (runoff baixo/alto)

### Calculadora de Rega - Opção Semanal (Tank)
- [x] Adicionar toggle "Por Rega" / "Por Semana (7 dias)" na calculadora de rega
- [x] Calcular número de regas por semana baseado na frequência
- [x] Calcular volume total necessário por semana
- [x] Calcular capacidade mínima recomendada do tank (+10% margem)
- [x] Mostrar breakdown: regas/semana, volume/rega, total semanal

### Calculadora de Fertilização - Opção por Semana
- [x] Adicionar toggle "Por Rega" / "Por Semana" na calculadora de fertilização
- [x] Calcular consumo semanal de cada nutriente
- [x] Mostrar quantidade total necessária por semana para o tank
- [ ] Calcular custo semanal estimado

## 🌱 Sistema de Plantas Individuais (NOVO)

### Modelo de Dados
- [x] Criar tabela `plants` (id, name, code, strainId, currentTentId, germDate, status)
- [x] Criar tabela `plantTentHistory` (histórico de mudanças de estufa)
- [x] Criar tabela `plantObservations` (observações diárias com timestamp)
- [x] Criar tabela `plantPhotos` (fotos com S3 URL, date, description)
- [x] Criar tabela `plantRunoffLogs` (runoff individual por rega)
- [x] Criar tabela `plantHealthLogs` (status saúde, notas, date)
- [x] Criar tabela `plantTrichomeLogs` (status tricomas: clear/cloudy/amber, fotos macro)
- [x] Criar tabela `plantLSTLogs` (técnicas LST aplicadas, fotos, resposta)
- [x] Rodar `pnpm db:push` para criar tabelas

### Backend (tRPC Procedures)
- [x] plants.create - criar nova planta
- [x] plants.list - listar plantas (filtros: tentId, strainId, status)
- [x] plants.getById - detalhes de uma planta
- [x] plants.update - atualizar informações básicas
- [x] plants.moveTent - mover planta para outra estufa
- [x] plants.finish - finalizar planta (harvest)
- [x] plantObservations.create - adicionar observação
- [x] plantObservations.list - listar observações de uma planta
- [ ] plantPhotos.upload - fazer upload de foto (S3)
- [x] plantPhotos.list - listar fotos de uma planta
- [ ] plantPhotos.delete - deletar foto
- [x] plantRunoff.create - registrar runoff
- [x] plantRunoff.list - histórico de runoff
- [x] plantHealth.create - registrar status de saúde
- [x] plantHealth.list - histórico de saúde
- [x] plantTrichomes.create - registrar status tricomas
- [x] plantTrichomes.list - histórico tricomas
- [x] plantLST.create - registrar técnica LST
- [x] plantLST.list - histórico LST

### Frontend - Listagem de Plantas
- [ ] Criar página `/plants` com listagem geral
- [ ] Adicionar aba "Plantas" na página de cada estufa
- [ ] Mostrar cards de plantas (foto, nome, dias de vida, saúde)
- [ ] Adicionar botão "Nova Planta"
- [ ] Adicionar filtros (estufa, strain, status)
- [ ] Adicionar busca por nome/código
- [ ] Mostrar contador de plantas por estufa no dashboard

### Frontend - Página Individual da Planta
- [ ] Criar página `/plants/[id]` com layout responsivo
- [ ] Seção Header: foto principal, nome, código, strain, estufa atual, dias de vida
- [ ] Botão "Mover para outra estufa" (modal com seleção)
- [ ] Botão "Finalizar Planta" (harvest)
- [ ] Tab 1: Timeline/Observações diárias (lista cronológica + formulário)
- [ ] Tab 2: Galeria de Fotos (grid responsivo + upload + lightbox)
- [ ] Tab 3: Runoff (gráfico de linha + tabela + formulário)
- [ ] Tab 4: Saúde (indicador visual + histórico + notas)
- [ ] Tab 5: Tricomas (status atual + fotos macro + histórico)
- [ ] Tab 6: LST (técnicas aplicadas + fotos antes/depois + notas)
- [ ] Tab 7: Histórico de Estufas (timeline de mudanças)

### Frontend - Formulários e Componentes
- [ ] Formulário de criação de planta (modal)
- [ ] Formulário de observação diária
- [ ] Componente de upload de fotos (drag & drop)
- [ ] Formulário de registro de runoff
- [ ] Formulário de saúde (select status + textarea notas)
- [ ] Formulário de tricomas (select status + upload fotos macro)
- [ ] Formulário de LST (checkboxes técnicas + upload fotos + notas)
- [ ] Modal de movimentação entre estufas

## 🧪 Testes
- [ ] Testar calculadora de runoff
- [ ] Testar calculadora de rega (modo diário e semanal)
- [ ] Testar calculadora de fertilização (modo por rega e semanal)
- [ ] Testar criação/edição/exclusão de plantas
- [ ] Testar movimentação de plantas entre estufas
- [ ] Testar upload de fotos (S3)
- [ ] Testar todos os registros (observações, runoff, saúde, tricomas, LST)
- [ ] Testar filtros e busca de plantas
- [ ] Testar responsividade mobile de todas as páginas

## 📦 Finalização
- [ ] Atualizar README com novas funcionalidades
- [ ] Criar/atualizar guia do usuário
- [ ] Salvar checkpoint final
- [ ] Gerar pacote de deploy

## Nova Tarefa: Página de Adicionar Planta

- [x] Criar página `/plants/new` com formulário
- [x] Campos: nome, código (opcional), strain, estufa inicial, data de germinação, notas
- [x] Validação de campos obrigatórios
- [x] Integração com tRPC `plants.create`
- [x] Redirecionamento após criação bem-sucedida
- [x] Adicionar rota no App.tsx

## Correção: Calculadora de Rega

- [x] Adicionar campo "Runoff Real Medido (%)" na calculadora
- [x] Calcular diferença entre runoff desejado e runoff real
- [x] Mostrar recomendação de ajuste de volume baseado na diferença
- [x] Se runoff real < desejado → aumentar volume
- [x] Se runoff real > desejado → diminuir volume

## Melhoria: Indicador de Plantas nas Estufas

- [x] Adicionar contador de plantas em cada card de estufa na página inicial
- [x] Mostrar ícone de planta + número no card
- [x] Atualizar backend para retornar contagem de plantas por estufa

## Melhoria: Agrupamento de Plantas por Estufa

- [x] Reorganizar página de plantas para agrupar por estufa
- [x] Adicionar seções colapsáveis para cada estufa
- [x] Botão rápido para mover planta entre estufas
- [x] Modal de confirmação ao mover planta
- [x] Atualizar lista após mover planta

## Correção de Erros - Página de Nova Planta

- [x] Corrigir erro "Objects are not valid as a React child" no toast
- [x] Corrigir erro "database.insert is not a function" no backend
- [x] Corrigir erro "database.select is not a function" no backend
- [x] Testar criação de nova planta após correções

## Sistema de Upload de Fotos para Plantas

### Backend
- [x] Criar procedure `plantPhotos.upload` para fazer upload de foto para S3
- [x] Criar procedure `plantPhotos.delete` para remover foto
- [x] Salvar metadados da foto no banco (URL, descrição, data)

### Frontend
- [x] Criar componente de upload com preview
- [x] Implementar preview de imagem antes do upload
- [x] Adicionar campo de descrição opcional
- [x] Mostrar progresso do upload
- [x] Atualizar PlantPhotosTab com funcionalidade de upload

### Galeria
- [x] Criar grid de fotos com thumbnails
- [x] Implementar lightbox para visualização em tela cheia
- [x] Adicionar timeline/ordenação por data
- [x] Botão de deletar foto
- [x] Zoom e navegação entre fotos

## Página Integrada de Rega e Runoff

### Modelo de Dados
- [x] Criar tabela `wateringLogs` (tentId, date, time, volumeIn, volumeOut, runoffPercent, notes)
- [x] Adicionar índices para consultas por estufa e data

### Backend
- [x] Criar procedure `watering.log` para registrar rega
- [x] Criar procedure `watering.list` para listar histórico (filtro por estufa e período)
- [x] Criar procedure `watering.delete` para remover registro
- [x] Calcular runoff% automaticamente no backend

### Frontend - Calculadora (Topo)
- [x] Manter toggle "Por Rega" / "Semanal (Tank)"
- [x] Mostrar volume ideal por rega
- [x] Mostrar totais semanais quando em modo Tank
- [ ] Salvar configuração (plantas, vasos, runoff desejado) para reutilizar

### Frontend - Registro de Runoff (Meio)
- [x] Botão "+ Registrar Rega"
- [x] Modal com campos: volume entrada, volume saída, horário, notas
- [x] Calcular runoff% automaticamente
- [x] Comparar com runoff desejado da calculadora
- [x] Mostrar recomendação de ajuste (aumentar/diminuir/manter)
- [x] Indicador visual: ✅ (ideal), ⚠️ (fora do ideal)

### Frontend - Histórico (Embaixo)
- [x] Lista de regas do dia agrupadas por data
- [x] Mostrar horário, volumes, runoff%, recomendação
- [x] Filtro por período (hoje, semana, mês)
- [ ] Gráfico de evolução do runoff ao longo do tempo
- [ ] Botão de deletar registro individual

## Melhorias na Página de Plantas

### Pesquisa e Documentação
- [ ] Pesquisar técnicas de treinamento de plantas (LST, Topping, FIM, Super Cropping, Lollipopping, Defoliação, Mainlining, ScrOG)
- [ ] Criar descrições detalhadas de cada técnica
- [ ] Definir quando aplicar cada técnica (semana ideal)

### Modelo de Dados
- [ ] Adicionar campo `photoUrl` em `plantHealthLogs` para fotos de saúde
- [ ] Adicionar campo `photoUrl` em `plantTrichomeLogs` para fotos macro
- [ ] Remover aba separada de fotos (mover para contextos específicos)
- [ ] Adicionar campo `weekNumber` em `plantTrichomeLogs`

### Aba de Saúde
- [x] Adicionar campo de data do registro
- [x] Adicionar upload de foto (documenta estado de saúde)
- [x] Galeria de fotos de saúde ordenadas por data
- [x] Preview de foto antes de salvar

### Aba de Tricomas
- [x] Mostrar semana atual do ciclo da planta
- [x] Adicionar upload de foto macro dos tricomas
- [x] Galeria de fotos de tricomas com data e semana
- [x] Zoom para visualizar detalhes

### Aba de LST
- [x] Criar seletor visual de técnicas com imagens ilustrativas
- [x] Técnicas: LST, Topping, FIM, Super Cropping, Lollipopping, Defoliação, Mainlining, ScrOG
- [x] Descrição de cada técnica ao selecionar
- [x] Campo de resposta da planta (texto)
- [x] Remover upload de foto (só imagens ilustrativas das técnicas)

### Lista de Plantas (Cards)
- [x] Adicionar última foto da planta no card
- [x] Badge de saúde (💚 Saudável, 💛 Estressada, ❤️ Doente, 💜 Recuperando)
- [x] Mostrar idade da planta (dias desde germinação)
- [ ] Mostrar fase atual (Vega/Flora + semana)
- [ ] Indicador visual de estufa atual
- [x] Melhorar layout dos cards para acomodar novos elementos

## Ajustes na Página de Plantas

- [x] Remover aba de Fotos do PlantDetail
- [x] Fotos ficam apenas na aba de Saúde
- [x] Adicionar preview da última foto de saúde nos cards das plantas (já implementado no backend)
- [x] Expandir descrições das técnicas de LST com mais detalhes e instruções
- [x] Melhorar textos explicativos sobre quando aplicar cada técnica

## Indicador de Fase da Planta

- [x] Atualizar backend plants.list para incluir fase do ciclo da estufa (VEGA/FLORA + semana)
- [ ] Atualizar backend plants.getById para incluir fase do ciclo da estufa
- [x] Adicionar badge de fase nos cards das plantas (ex: "Vega Semana 4", "Flora Semana 2")
- [ ] Adicionar indicador de fase no header da página de detalhes da planta
- [x] Calcular semana baseado na data de início do ciclo e fase atual

## Ajustes de Runoff - Por Estufa (não por planta)

- [x] Remover aba de Runoff da página de detalhes da planta (PlantDetail.tsx)
- [x] Remover import e componente PlantRunoffTab
- [x] Runoff será medido por estufa na página de Rega e Runoff
- [x] Cálculo considera todas as plantas da estufa juntas (base coletora única)

## Simplificação das Calculadoras de Rega e Runoff

### Calculadora de Rega
- [x] Campos: número de plantas, tamanho vaso, runoff desejado, runoff real da última rega (opcional)
- [x] Cálculo base: volume por planta baseado no runoff desejado
- [x] Cálculo ajustado: se runoff real fornecido, ajustar volume para atingir runoff desejado
- [x] Mostrar volume por planta e volume total

### Calculadora de Runoff
- [x] Campos: volume regado (L), volume coletado no copo (L)
- [x] Calcular runoff % real
- [x] Comparar com ideal (se fornecido)
- [x] Indicador visual: ✅ ideal, ⚠️ fora do ideal

### Remover
- [x] Remover sistema de registro/histórico de regas
- [ ] Remover tabela wateringLogs do banco (opcional - não afeta funcionamento)
- [x] Remover procedures watering.log, watering.list, watering.delete
- [x] Remover modo semanal/tank
- [x] Simplificar página WateringRunoff para apenas 2 calculadoras

## Tarefas Finais

- [x] Adicionar cálculo de custo semanal na calculadora de fertilização
- [x] Adicionar indicador de fase no header da página de detalhes da planta

## Reorganização de Calculadoras

- [x] Mover componentes de Rega e Runoff para página de Calculadoras como aba
- [x] Remover calculadoras antigas de rega e runoff da página de Calculadoras
- [x] Remover rota `/watering-runoff` do App.tsx
- [x] Remover link "Rega e Runoff" do Sidebar
- [x] Remover arquivo WateringRunoff.tsx

## Melhorias no Sistema de Fotos

- [x] Implementar compressão de imagens no frontend antes do upload
- [x] Adicionar crop/resize para aspect ratio iPhone (3:4 vertical)
- [x] Migrar armazenamento de fotos para sistema flexível (local ou S3)
- [x] Garantir que última foto aparece nos cards da lista de plantas
- [x] Corrigir visualização da galeria de fotos nas abas de Saúde e Tricomas
- [x] Atualizar backend para usar storagePut() unificado
- [x] Atualizar schema do banco para armazenar URLs ao invés de base64

## Sistema de Storage Flexível

- [x] Criar sistema de storage local (pasta uploads/)
- [x] Adicionar variável de ambiente STORAGE_TYPE (local ou s3)
- [x] Atualizar backend para suportar storage local e S3
- [x] Criar guia de configuração para diferentes opções de storage
- [x] Adicionar .gitignore para pasta uploads/
- [x] Criar endpoint para servir arquivos estáticos da pasta uploads/

## Refatoração do Sistema de Plantas

- [x] Reordenar menu de plantas: Saúde primeiro, Observações último
- [x] Remover campo germDate (data de germinação) do schema de plantas
- [x] Remover input de data de germinação do formulário de criação de plantas
- [x] Atualizar lógica para plantas seguirem automaticamente o ciclo da estufa
- [x] Remover cálculo de idade baseado em germDate
- [x] Atualizar cards de plantas para mostrar fase/semana do ciclo da estufa
- [x] Testar movimentação de plantas entre estufas (devem adotar novo ciclo)

## Calculadora de Fertilização - Predefinições de EC

- [x] Adicionar seletor de fase/semana na calculadora de fertilização
- [x] Implementar valores predefinidos de EC baseados na tabela weeklyTargets
- [x] Adicionar checkbox para alternar entre EC predefinido e manual
- [x] Manter opção de edição manual dos valores se necessário

## Correção de Carregamento de Fotos

- [x] Investigar por que fotos não aparecem nos cards das plantas
- [x] Investigar por que fotos não aparecem na galeria de saúde
- [x] Verificar se URLs das fotos estão corretas no banco de dados
- [x] Verificar se servidor está servindo arquivos da pasta uploads/
- [x] Corrigir caminho absoluto para pasta uploads no servidor
- [x] Limpar registros antigos de fotos para novo teste

## Melhoria de Layout - Galeria de Saúde

- [x] Reorganizar layout da galeria de saúde para visualização lateral
- [x] Fotos à direita (aspect ratio 3:4)
- [x] Dados (status, sintomas, tratamento, notas) à esquerda
- [x] Melhorar responsividade para mobile

## Correções de Sinalização e Ações de Plantas

- [x] Corrigir sinalizações duplicadas/confusas no menu da planta (Ativa + Flora Semana quando está na Vega)
- [x] Mostrar apenas uma badge com fase atual da estufa (ex: "Vega Semana 3")
- [ ] Adicionar menu de ações rápidas no detalhe da planta
- [ ] Implementar botão "Transplantar para Flora" (move planta para estufa de Flora)
- [ ] Implementar botão "Colher" (marca planta como colhida)
- [ ] Manter botão "Mover Estufa" existente para escolha manual

## Restaurar Cálculo de Rega por Semana

- [x] Adicionar seletor de fase/semana na calculadora de rega
- [x] Buscar valores recomendados de rega baseados na tabela weeklyTargets
- [x] Manter opção de edição manual dos valores

## Implementação de Lógica de Ações de Plantas

- [x] Criar procedure `plants.transplantToFlora` no backend
- [x] Criar procedure `plants.harvest` no backend (já existia como `plants.finish`)
- [x] Criar procedure `plants.moveTent` no backend (já existia)
- [x] Conectar botão "Transplantar para Flora" ao procedure
- [x] Conectar botão "Colher" ao procedure
- [ ] Conectar botão "Mover Estufa" ao procedure (placeholder mantido)
- [x] Adicionar sistema de notificações toast (Sonner)
- [x] Implementar confirmação antes de ações críticas (confirm dialog)
- [x] Atualizar lista de plantas após ações bem-sucedidas (refetch)

## Modal de Mover Estufa

- [x] Criar componente MoveTentModal com Dialog do shadcn/ui
- [x] Buscar lista de estufas disponíveis com seus ciclos ativos
- [x] Exibir cards visuais de cada estufa com nome, fase e semana
- [x] Destacar estufa atual da planta
- [x] Adicionar botão de confirmação para mover
- [x] Integrar com procedure plants.moveTent do backend
- [x] Adicionar notificação toast de sucesso/erro
- [x] Conectar modal ao botão "Mover para Outra Estufa" do dropdown

## Correção da Calculadora de Rega

- [x] Remover seletor de fase/semana da calculadora de rega (era confusão)
- [x] Manter apenas inputs manuais na calculadora de rega
- [x] Adicionar cálculo semanal embaixo do resultado diário
- [x] Mostrar "Rega Diária: X litros" e "Rega Semanal: Y litros"
- [x] Confirmar que seletor de fase/semana permanece apenas na calculadora de fertilização

## Correção de Exibição de Fase/Semana na Página de Detalhes

- [x] Investigar por que está mostrando "Flora Semana" quando planta está na Vega
- [x] Corrigir lógica para mostrar fase/semana correta do ciclo ativo da estufa
- [x] Garantir que badge mostre fase atual da estufa onde a planta está

## Correção da Calculadora de Fertilização - Valores Automáticos de EC

- [x] Implementar busca de valores de EC da tabela weeklyTargets (já estava implementado)
- [x] Preencher campo de EC automaticamente quando fase/semana são selecionados (já estava implementado)
- [x] Manter opção de edição manual do EC (checkbox para alternar)
- [x] Checkbox vem marcado por padrão para usar valores recomendados


## 🎨 Melhorias no Sistema de Fotos e Registros de Saúde

### Lightbox Aprimorado
- [x] Adicionar botão de download de foto no lightbox
- [x] Implementar navegação entre fotos (setas próxima/anterior)
- [x] Melhorar escurecimento de tela (overlay mais escuro)
- [x] Adicionar informações da foto (data, tamanho) no lightbox
- [x] Adicionar contador de fotos (ex: "3 / 12")
- [ ] Suporte a gestos de swipe no mobile para navegar

### Edição e Exclusão de Registros de Saúde
- [x] Backend: Criar procedure `plantHealth.update` para editar registro
- [x] Backend: Criar procedure `plantHealth.delete` para excluir registro
- [x] Frontend: Adicionar botão "Editar" em cada registro de saúde
- [x] Frontend: Adicionar botão "Excluir" em cada registro de saúde
- [x] Frontend: Modal de confirmação antes de excluir
- [ ] Frontend: Modal de edição com formulário preenchido (usa mesmo formulário)
- [x] Frontend: Possibilidade de trocar foto ao editar
- [x] Frontend: Atualizar lista após edição/exclusão

### Conversão Automática HEIC → JPEG
- [x] Instalar biblioteca heic2any no frontend
- [x] Detectar formato HEIC/HEIF automaticamente
- [x] Converter para JPEG antes de processar
- [x] Mostrar toast informando conversão
- [ ] Testar com foto real do iPhone (precisa dispositivo físico)
- [x] Preservar qualidade na conversão (quality: 0.9)

### Acesso à Câmera no Mobile
- [x] Adicionar botão "📸 Tirar Foto" além de "📁 Escolher Arquivo"
- [x] Usar input[type="file"] com capture="environment"
- [x] Abrir câmera traseira por padrão no mobile
- [x] Preview imediato após captura
- [ ] Testar em dispositivo mobile real (iPhone/Android)
- [x] Fallback para seleção de arquivo se câmera não disponível (automático)


## 🎨 Modal de Edição Dedicado para Registros de Saúde

- [x] Criar componente Dialog separado para edição
- [x] Formulário com campos preenchidos do registro atual
- [x] Título claro "Editar Registro de Saúde"
- [x] Possibilidade de trocar foto (preview da foto atual)
- [x] Botões "Cancelar" e "Salvar Alterações"
- [x] Integrar com botão de editar nos cards
- [x] Fechar modal após salvar com sucesso
- [x] Testar fluxo completo de edição


## 🐛 Bugs Reportados

### Bug: Captura de Foto no iPhone
- [ ] Investigar logs do navegador no site publicado
- [ ] Verificar permissões de câmera no iOS
- [ ] Testar atributo capture="environment" no iPhone
- [ ] Implementar fallback para iOS se necessário
- [ ] Adicionar tratamento de erro específico para iPhone
- [ ] Testar em dispositivo iPhone real

### Bug: Calculadora de Fertilização "Por Semana" Não Funciona
- [ ] Investigar modo "per-week" na calculadora de fertilização
- [ ] Verificar se cálculo semanal está correto
- [ ] Verificar se resultado semanal está sendo exibido
- [ ] Testar com diferentes valores de irrigações por semana
- [ ] Validar fórmulas de multiplicação semanal


## 🔧 Refazer Calculadora de Fertilização do Zero

- [x] Fazer backup do código atual da FertilizationCalculator
- [x] Reescrever FertilizationCalculator completamente (FertilizationCalculatorNew.tsx)
- [x] Implementar seletor "Por Rega" / "Por Semana" visível
- [x] Implementar checkbox "Usar EC recomendado por fase/semana" visível
- [x] Implementar seletores de Fase (Vega/Flora) e Semana (1-8) visíveis
- [x] Conectar com backend weeklyTargets.get
- [x] Preencher EC automaticamente quando selecionar fase/semana
- [ ] Testar funcionalidade completa no navegador (aguardando publicação)
- [ ] Problema de cache/HMR no ambiente de desenvolvimento


## 🐛 Bug: Câmera não Funciona no iPhone

### Investigação
- [x] Pesquisar problemas conhecidos do iOS Safari com input[type="file"] e capture
- [x] Verificar se HTTPS é obrigatório para acesso à câmera no iOS
- [x] Testar se atributo accept precisa incluir formatos específicos do iOS
- [x] Verificar se há restrições de permissões no iOS Safari

### Correções
- [x] Adicionar accept="image/*,image/heic,image/heif" explicitamente
- [x] Manter atributo capture para iOS (funciona em versões recentes)
- [x] Adicionar tratamento de erro específico com console.log para debug
- [x] Adicionar logs detalhados de seleção de arquivo
- [ ] Testar em iPhone real após correções (requer dispositivo físico)


## 🐛 Bug: Calculadora de Fertilização Não Atualiza

- [x] Remover completamente componente FertilizationCalculator antigo (deletado linhas 958-1310)
- [x] Substituir todas as referências pelo novo componente (FertilizationCalculatorNew)
- [x] Limpar cache do navegador e Vite
- [ ] Testar após publicação do site


## 💾 Sistema de Predefinições Personalizadas

### Backend - Banco de Dados
- [x] Criar tabela `fertilizationPresets` (userId, name, waterVolume, targetEC, phase, weekNumber, irrigationsPerWeek, calculationMode)
- [x] Criar tabela `wateringPresets` (userId, name, plantCount, potSize, targetRunoff, phase, weekNumber)
- [x] Rodar `pnpm db:push` para criar tabelas (criadas via SQL direto)

### Backend - tRPC Procedures
- [x] fertilizationPresets.create - salvar nova predefinição
- [x] fertilizationPresets.list - listar predefinições do usuário
- [x] fertilizationPresets.delete - excluir predefinição
- [x] fertilizationPresets.update - editar predefinição
- [x] wateringPresets.create - salvar nova predefinição
- [x] wateringPresets.list - listar predefinições do usuário
- [x] wateringPresets.delete - excluir predefinição
- [x] wateringPresets.update - editar predefinição

### Frontend - Calculadora de Fertilização
- [x] Adicionar botão "💾 Salvar Predefinição" no formulário
- [x] Modal para nomear e salvar predefinição
- [x] Seção "Minhas Predefinições" com lista de cards
- [x] Botão "Carregar" em cada card para preencher formulário
- [x] Botão "Excluir" em cada card
- [ ] Botão "Editar" em cada card (pode usar update procedure)

### Frontend - Calculadora de Rega
- [x] Adicionar botão "💾 Salvar Predefinição" no formulário (componente criado)
- [x] Modal para nomear e salvar predefinição (componente criado)
- [x] Seção "Minhas Predefinições" com lista de cards (componente criado)
- [x] Botão "Carregar" em cada card para preencher formulário (componente criado)
- [x] Botão "Excluir" em cada card (componente criado)
- [ ] Integrar WateringPresetsManager no IrrigationCalculator
- [ ] Botão "Editar" em cada card (pode usar update procedure)

### Testes
- [ ] Testar criação de predefinição de fertilização
- [ ] Testar carregamento de predefinição de fertilização
- [ ] Testar exclusão de predefinição de fertilização
- [ ] Testar criação de predefinição de rega
- [ ] Testar carregamento de predefinição de rega
- [ ] Testar exclusão de predefinição de rega


## 🐛 Bug Crítico: Mudanças Não Aparecem

- [ ] Verificar status do servidor de desenvolvimento
- [ ] Confirmar que arquivos foram salvos corretamente
- [ ] Limpar cache do Vite completamente
- [ ] Forçar rebuild completo
- [ ] Verificar se preview mostra mudanças
- [ ] Verificar se site publicado mostra mudanças após republish


## 🔥 URGENTE: Reescrever Calculadora de Fertilização

- [x] Apagar FertilizationCalculatorNew.tsx
- [x] Apagar FertilizationPresetsManager.tsx  
- [x] Criar nova calculadora simples e funcional (FertilizationCalculator.tsx)
- [x] Implementar seletor de Fase (Vega/Flora) e Semana (1-8)
- [x] Buscar EC recomendado do backend (weeklyTargets)
- [x] Permitir EC personalizado
- [x] Calcular reagentes NPK baseado em volume e EC
- [ ] Testar no navegador (aguardando cache limpar)


## 💾 Sistema de Predefinições de Fertilização

- [x] Adicionar botão "💾 Salvar Predefinição" na calculadora
- [x] Modal para nomear predefinição
- [x] Salvar valores atuais (fase, semana, volume, EC) no backend
- [x] Listar predefinições salvas abaixo do formulário
- [x] Botão "Carregar" em cada predefinição
- [x] Botão "Excluir" em cada predefinição
- [ ] Testar fluxo completo (aguardando teste no navegador)


## 🔗 Compartilhamento de Receitas de Fertilização

- [x] Adicionar botão "Compartilhar" em cada predefinição
- [x] Gerar código/link compartilhável (base64)
- [x] Modal com código para copiar
- [x] Botão "Importar Receita" na calculadora
- [x] Modal para colar código/link recebido
- [x] Validar e carregar receita importada
- [x] Toast de sucesso ao importar
- [ ] Testar fluxo completo de compartilhamento (aguardando teste no navegador)


## 🐛 Bug: Fotos da Saúde - Ícone de Imagem Quebrada

- [x] Upload funciona corretamente
- [ ] Investigar por que imagem não aparece (fica com ícone quebrado)
- [ ] Verificar se caminho da foto salvo no banco está correto
- [ ] Verificar se servidor está servindo pasta uploads/ via HTTP
- [ ] Verificar permissões de arquivo
- [ ] Testar visualização após correção

## 🎨 UX: Lista de Procedimentos Muito Longa

- [ ] Implementar Accordion/Collapsible para detalhes dos procedimentos
- [ ] Mostrar apenas título e data por padrão
- [ ] Botão "Ver mais" ou seta para expandir detalhes
- [ ] Manter foto sempre visível (não colapsar)
- [ ] Testar usabilidade no mobile


## 🔄 Refazer UX da Calculadora de Fertilização

- [x] Remover botão "Calcular" - resultado deve aparecer automaticamente
- [x] EC pré-definido carrega automaticamente ao selecionar fase/semana
- [x] Adicionar checkbox "Usar EC personalizado"
- [x] Quando checkbox marcado: desabilita EC pré-definido e permite edição manual
- [x] Quando checkbox desmarcado: usa EC da semana selecionada
- [x] Resultado aparece automaticamente ao mudar qualquer valor (useEffect)
- [ ] Testar fluxo completo no navegador

## Correções de Sistema de Fotos e Calculadora

- [x] Criar pasta uploads/ na raiz do projeto
- [x] Configurar .gitignore para manter estrutura mas ignorar conteúdo
- [x] Adicionar import de useEffect no FertilizationCalculator
- [x] Corrigir erro "Can't find variable: useEffect" na calculadora de fertilização
- [x] Sistema de fotos agora funcional (servidor Express já configurado)
