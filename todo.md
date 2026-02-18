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
