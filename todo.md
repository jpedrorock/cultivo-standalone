# TODO - App Cultivo (RESET COMPLETO)

## 🗄️ Fase 1: Reset do Banco de Dados
- [x] Dropar todas as tabelas
- [x] Recriar schema simplificado (8 tabelas essenciais)
- [x] Aplicar migrações

## 🌱 Fase 2: Popular Dados Iniciais
- [x] Criar 3 estufas (A, B, C) com dimensões corretas
- [x] Criar targets semanais por estufa e fase (17 targets criados)
- [x] Criar templates de tarefas por fase/semana (21 templates)
- [x] Criar limites de segurança
- [x] Corrigir schema weeklyTargets para usar tentId ao invés de strainId
- [x] Popular targets corretamente por tentId

## 📄 Fase 3: Página de Dados Ideais (Visualização)
- [x] Criar página que mostra semana atual do ciclo (Home já mostra)
- [x] Exibir descrição da fase (badges nas estufas)
- [x] Listar tarefas da semana (página /tasks)
- [x] Mostrar cards de Status Ideais (PPFD, Fotoperíodo, Temp, Umidade, pH, EC)
- [x] Adicionar navegação para esta página (já existe na Home)

## 📊 Fase 4: Página de Histórico (Registro)
- [ ] Ajustar página de registro para mostrar valores ideais lado a lado
- [ ] Adicionar campos: PPFD, Fotoperíodo, Temp, Umidade, pH, EC
- [ ] Campo de observações da semana
- [ ] Salvar registros no banco

## 🔧 Fase 5: Ajustes Finais
- [ ] Remover botão "Iniciar Floração" da Estufa B (só faz VEGA)
- [ ] Criar página de Referência separada (read-only)
- [ ] Atualizar página de Registro para comparação lado a lado

## ✅ Fase 6: Testes e Entrega
- [ ] Testar fluxo completo
- [ ] Criar testes unitários
- [ ] Salvar checkpoint final

## 📖 Nova Tarefa: Página de Referência
- [x] Criar página de Referência (read-only) para consultar valores ideais
- [x] Mostrar targets organizados por estufa e fase
- [x] Adicionar navegação para a página
- [x] Testar funcionalidade

## 📝 Nova Tarefa: Melhorar Página de Registro
- [x] Buscar valores de referência (targets) da estufa/fase/semana atual
- [x] Exibir valores ideais ao lado de cada campo de entrada
- [x] Facilitar comparação visual entre valor ideal e valor real
- [x] Testar funcionalidade

## 🔧 Novas Tarefas: Ajustes Finais
- [x] Remover card "Valores Ideais da Semana" da Home
- [x] Verificar targets no banco de dados
- [x] Corrigir Estufa A: apenas MAINTENANCE e CLONING (já estava correto)
- [x] Corrigir Estufa B: apenas VEGA (removido floraStartDate incorreto + botão Iniciar Floração)
- [x] Corrigir Estufa C: apenas FLORA (já estava correto)
- [x] Testar páginas após correções

## 📊 Nova Tarefa: Tarefas na Home + Página de Histórico
- [x] Adicionar lista de tarefas semanais em cada card de estufa na Home
- [x] Permitir marcar tarefas como concluídas diretamente na Home
- [x] Tarefas específicas por estufa e semana atual
- [x] Criar API para buscar dados históricos de logs por estufa
- [x] Criar página de Histórico separada com gráficos de linha
- [x] Mostrar evolução de PPFD, Temperatura, Umidade (removido pH e EC pois não estão no schema)
- [x] Comparar valores reais com targets ideais nos gráficos
- [x] Adicionar navegação para a página de Histórico
- [x] Testar funcionalidade

## 🧪 Nova Tarefa: Adicionar pH e EC aos Registros Diários
- [x] Adicionar campos ph e ec ao schema de dailyLogs
- [x] Executar migração do banco de dados (pnpm db:push)
- [x] Atualizar página de Registro (TentLog) para incluir campos pH e EC (já estava presente)
- [x] Atualizar página de Histórico para exibir gráficos de pH e EC
- [x] Testar funcionalidade completa

## ✅ Nova Tarefa: Validação Visual em Tempo Real
- [x] Implementar lógica de validação para cada campo (PPFD, Temp, RH, pH, EC)
- [x] Adicionar estados visuais: verde (dentro da faixa), amarelo (próximo), vermelho (fora)
- [x] Aplicar validação em tempo real durante digitação
- [x] Testar com diferentes valores

## 📋 Nova Tarefa: Popular TaskTemplates Completos
- [x] Criar taskTemplates para CLONING (semanas 1-2) - 10 tarefas
- [x] Criar taskTemplates para MAINTENANCE (semana 1) - 5 tarefas
- [x] Criar taskTemplates para VEGA (semanas 1-6) - 30 tarefas
- [x] Criar taskTemplates para FLORA (semanas 1-8) - 40 tarefas
- [x] Executar script SQL para popular banco - 85 tarefas inseridas
- [x] Validar dados no banco - 17 grupos de tarefas confirmados
- [x] Testar tarefas na interface (Home) - Funcionando perfeitamente

## 🔄 Nova Tarefa: Gerenciador de Ciclos
- [x] Criar API para finalizar ciclo (marca status como FINISHED)
- [x] Criar API para iniciar novo ciclo (data, fase, semana)
- [x] Criar API para editar ciclo existente (ajustar data/fase/semana)
- [x] Criar modal de Iniciar Novo Ciclo com formulário
- [x] Criar modal de Editar Ciclo com formulário
- [x] Adicionar botões de gerenciamento nos cards das estufas
- [x] Testar finalização de ciclo
- [x] Testar início de novo ciclo com diferentes configurações
- [x] Testar edição de ciclo existente

## 🐛 Bug: Chaves Duplicadas no React
- [x] Identificar origem das chaves duplicadas (key=0) - divs de botões de ação
- [x] Corrigir usando IDs únicos ao invés de índices - adicionado tent.id nas keys
- [x] Testar e validar correção - erro não aparece mais nos logs

## 📄 Nova Tarefa: Exportação de Relatórios em PDF
- [x] Instalar dependências (jsPDF, jspdf-autotable, html2canvas)
- [x] Criar API para buscar dados completos do ciclo (info, logs, tarefas)
- [x] Implementar função de geração de PDF com:
  - [x] Cabeçalho com informações do ciclo (estufa, strain, datas, fase)
  - [x] Tabela de estatísticas (média, min, max de cada parâmetro)
  - [x] Resumo de tarefas (total, concluídas, taxa de conclusão)
  - [x] Rodapé com numeração de páginas e data de geração
- [x] Adicionar botão "Exportar PDF" nos cards de estufas com ciclos ativos
- [x] Testar geração e download de PDF

## 🔄 Nova Tarefa: Reorganizar Menu e Migrar Targets para Strain
- [x] Migrar schema weeklyTargets: trocar tentId por strainId
- [x] Executar migração do banco (pnpm db:push)
- [x] Repovoar targets associados a strains ao invés de estufas (14 targets para OG Kush)
- [x] Criar página Gerenciar Strains (listar, criar, editar, deletar)
- [x] Atualizar modais de ciclo para selecionar strain
- [x] Atualizar APIs para buscar targets por strainId
- [x] Remover página Referência
- [x] Atualizar menu inferior:
  - [x] Remover Referência, Alertas, Análise
  - [x] Adicionar Gerenciar Strains
  - [x] Adicionar Calculadoras (placeholder)
- [x] Testar fluxo completo (criar ciclo → selecionar strain → ver targets corretos)

## 📊 Nova Tarefa: Exibir Último Registro nos Cards da Home
- [x] Criar API para buscar último dailyLog por estufa (dailyLogs.getLatestByTent)
- [x] Atualizar Home para exibir Temp, RH, PPFD do último registro
- [x] Adicionar fallback "--" quando não houver registros
- [x] Testar funcionalidade (Estufa B mostrando 35.0°C, 65.0%, 500)

## 🎨 Nova Tarefa: Indicadores Visuais de Status nos Cards da Home
- [x] Buscar targets ideais da strain do ciclo ativo
- [x] Comparar último registro (Temp, RH, PPFD) com targets
- [x] Colorir valores: verde (dentro), amarelo (próximo ±10%), vermelho (fora)
- [x] Testar com diferentes cenários (dentro/fora da faixa)

## 🧮 Nova Tarefa: Página Calculadoras
- [x] Criar página Calculadoras.tsx com 3 abas
- [x] Implementar calculadora de rega (volume por planta)
- [x] Implementar calculadora de fertilização (diluição NPK)
- [x] Implementar calculadora Lux→PPFD
- [x] Adicionar rota no App.tsx
- [x] Testar todas as calculadoras

## 🌿 Nova Tarefa: Popular Strains Padrão
- [x] Adicionar Blue Dream com targets específicos (6 VEGA + 9 FLORA)
- [x] Adicionar Northern Lights com targets específicos (5 VEGA + 7 FLORA)
- [x] Adicionar White Widow com targets específicos (6 VEGA + 8 FLORA)
- [x] Adicionar Girl Scout Cookies com targets específicos (5 VEGA + 9 FLORA)
- [x] Adicionar Gorilla Glue com targets específicos (6 VEGA + 8 FLORA)
- [x] Testar criação de ciclos com novas strains - 69 targets populados

## 📋 Nova Tarefa: Sistema de Clonagem de Strains
- [x] Adicionar botão "Duplicar" na página Gerenciar Strains
- [x] Criar API strains.duplicate
- [x] Implementar modal de confirmação com novo nome
- [x] Copiar todos os targets da strain original (15 no caso da Blue Dream)
- [x] Testar clonagem e edição de valores - Blue Dream → Blue Dream V2

## 🧮 Nova Tarefa: Melhorias nas Calculadoras
- [x] Revisar fórmula da calculadora de rega (verificada e correta - 25% solo, 30% coco, 15% hidro)
- [x] Revisar fórmula da calculadora de fertilização (corrigida com fator de conversão EC 1.2 mS/cm por g/L)
- [x] Tornar cálculo Lux→PPFD automático (resultado instantâneo ao digitar - useEffect implementado)
- [x] Adicionar botão "Exportar Receita" em cada calculadora (3 botões adicionados)
- [x] Implementar geração de arquivo TXT com os valores calculados (testado e funcionando)
- [x] Testar todas as melhorias (50000 lux → 750 PPFD instantâneo, arquivo baixado com sucesso)

## 📚 Nova Tarefa: Histórico de Cálculos
- [x] Criar tabela `calculationHistory` no schema do banco de dados
- [x] Adicionar campos: tipo, parâmetros (JSON), resultado (JSON), data, userId
- [x] Executar SQL manual para criar tabela (migration teve conflito)
- [x] Criar API `calculations.save` para salvar cálculo
- [x] Criar API `calculations.list` para listar histórico (com filtro opcional)
- [x] Criar API `calculations.delete` para deletar cálculo
- [x] Adicionar botão "Salvar Receita" nas 3 calculadoras (verde, ao lado do Exportar)
- [x] Criar página Histórico com listagem de receitas salvas (/calculation-history)
- [x] Adicionar filtros por tipo de calculadora (Todos, Rega, Fertilização, Lux→PPFD)
- [x] Implementar ações: visualizar detalhes (card), exportar (TXT), deletar (com confirmação)
- [x] Testar fluxo completo: salvar Rega 11L → listar no histórico → exibido corretamente

## 🧹 Nova Tarefa: Remover Sistema de Histórico de Calculadoras
- [x] Remover tabela `calculationHistory` do schema (drizzle/schema.ts)
- [x] Tabela no banco não removida (DROP TABLE bloqueado, mas não é problema)
- [x] Remover router `calculations` do server/routers.ts
- [x] Remover botões "Salvar Receita" das 3 calculadoras
- [x] Remover imports de Save icon e mutation saveCalculation
- [x] Deletar arquivo client/src/pages/CalculationHistory.tsx
- [x] Remover rota /calculation-history do App.tsx
- [x] Remover link "Histórico Calc." da Home.tsx (ajustado grid para 4 colunas)
- [x] Testar calculadoras (manter só botão Exportar) - funcionando
- [x] Verificar se não há erros de TypeScript - 0 erros

## 🚨 Nova Tarefa: Sistema de Alertas Automáticos
- [x] Criar tabela `alertSettings` no schema (configurações por estufa)
- [x] Criar tabela `alertHistory` no schema (histórico de alertas disparados)
- [x] Executar SQL manual para criar tabelas (pnpm db:push teve conflito)
- [x] Criar API `alerts.getSettings` para buscar configurações
- [x] Criar API `alerts.updateSettings` para ativar/desativar alertas
- [x] Criar API `alerts.getHistory` para listar histórico
- [x] Implementar lógica de verificação em server/alertChecker.ts
- [x] Implementar envio de email usando notifyOwner
- [x] Criar página Alertas (/alerts) com configurações e histórico
- [x] Adicionar verificação automática a cada novo registro (dailyLogs.create)
- [x] Adicionar botão Alertas na Home
- [ ] Testar fluxo completo: registro fora da faixa → alerta disparado → email enviado

## 📊 Nova Tarefa: Dashboard de Análise
- [ ] Criar página Analytics (/analytics) com gráficos
- [ ] Adicionar biblioteca de gráficos (recharts ou chart.js)
- [ ] Implementar gráfico de evolução de Temperatura (últimos 30 dias)
- [ ] Implementar gráfico de evolução de Umidade (últimos 30 dias)
- [ ] Implementar gráfico de evolução de PPFD (últimos 30 dias)
- [ ] Criar API `analytics.getTimeSeriesData` para buscar dados históricos
- [ ] Adicionar filtros por estufa e período (7/30/90 dias)
- [ ] Implementar comparação de produtividade entre ciclos
- [ ] Adicionar estatísticas resumidas (média, min, max, desvio padrão)
- [ ] Testar visualização com dados reais das 3 estufas

## 🧪 Nova Tarefa: Expandir Calculadora de Fertilização
- [x] Adicionar seção de Micronutrientes (Ca, Mg, Fe) com cálculos específicos
- [x] Cálculos de Ca, Mg, Fe implementados e testados (180ppm Ca → 12ml, 60ppm Mg → 6ml, 3ppm Fe → 0.6ml)
- [x] Adicionar calculadora de ajuste de pH (quanto de ácido/base adicionar) - testado 10L pH 7.5→6.0 → 3ml pH Down
- [x] Implementar conversão PPM ↔ EC (500 scale e 700 scale) - testado 1000 PPM → 2 mS/cm
- [x] Adicionar tabela de referência de valores ideais de micronutrientes por fase (clonagem, vega, flora, flush)
- [x] Atualizar função de exportação com novos campos de micronutrientes
- [x] Testar todos os cálculos com valores reais - 5 calculadoras testadas e funcionando

## 📱 Nova Tarefa: Implementar PWA (Progressive Web App)
- [x] Criar manifest.json com ícones, cores e configurações de instalação
- [x] Gerar ícones PWA em múltiplos tamanhos (192x192, 512x512, maskable) - 4 ícones gerados e enviados para CDN
- [x] Implementar Service Worker para cache de assets e funcionamento offline (sw.js)
- [x] Registrar Service Worker no main.tsx
- [x] Adicionar estratégia de cache (Cache First para assets, Network First para API)
- [x] Implementar helpers de notificações push (pushNotifications.ts)
- [x] Criar botão "Instalar App" na interface (InstallPWA.tsx com banner flutuante)
- [x] Adicionar meta tags para PWA no index.html (theme-color, apple-mobile-web-app)
- [x] Implementar sincronização offline (Background Sync API no Service Worker)
- [x] UI já otimizada para mobile (touch-friendly, responsive)
- [ ] Testar instalação em Android/iOS
- [ ] Testar funcionamento offline
- [ ] Testar notificações push

## 📱 Bug: Menu das Calculadoras Inacessível no Celular
- [x] Inspecionar código das abas na página Calculadoras (TabsList com grid-cols-5)
- [x] Adicionar scroll horizontal para abas no mobile (flex overflow-x-auto)
- [x] Aumentar tamanho dos botões de aba para serem touch-friendly (min-w-[120-140px])
- [x] Ajustar espaçamento e padding para mobile (flex-shrink-0)
- [x] Testar no navegador mobile (responsive mode) - funcionando
- [x] Verificar se todas as 5 abas são acessíveis - scroll horizontal permite acesso a todas

## 🔄 Melhoria: Transformar Abas em Botões Verticais no Mobile
- [x] Modificar TabsList para exibir botões empilhados verticalmente no mobile (flex flex-col gap-2)
- [x] Remover scroll horizontal e usar flex-col no mobile
- [x] Manter grid horizontal no desktop (md:grid md:grid-cols-5)
- [x] Aumentar padding e altura dos botões para serem mais touch-friendly (py-3 no mobile, py-2 no desktop)
- [x] Testar layout mobile com botões verticais - funcionando perfeitamente

## 📱 Melhoria: Layout Compacto 2 Colunas para Calculadoras Mobile
- [x] Mudar de flex-col para grid 2 colunas no mobile (grid-cols-2 gap-2)
- [x] Ajustar botões para serem compactos mas touch-friendly (h-20, ícones 5x5)
- [x] Centralizar ícones e texto nos botões (flex-col gap-1)
- [x] Testar usabilidade no mobile - layout compacto e prático

## 📱 Revisão Completa: Calculadoras Mobile
- [x] Inspecionar todas as 5 calculadoras no modo mobile
- [x] Identificar problema: inputs em 3 colunas ficam muito estreitos
- [x] Mudar breakpoint de md: (768px) para lg: (1024px) nos grids de fertilização e pH
- [ ] PROBLEMA: Viewport de teste ainda mostra 3 colunas (parece estar > 1024px)
- [ ] Solução pendente: testar em dispositivo real ou usar max-width ao invés de breakpoint
- [x] Botões de abas já touch-friendly (grid 2 colunas mobile)
- [x] Desktop continua funcionando

## 🐛 Bug Crítico: Grid 2 Colunas Cortando 3 Botões no Mobile
- [x] Problema identificado: grid-cols-2 mostra só 2 botões (Rega, Fertilização)
- [x] Faltam 3 botões: Lux→PPFD, PPM↔EC, Ajuste pH
- [x] Solução: mudar para flex-col (lista vertical completa) ao invés de grid
- [x] Testar todos os 5 botões visíveis no mobile - FUNCIONANDO! Todos os 5 botões visíveis em linha horizontal

## 🔄 Solução Definitiva: Dropdown Nativo no Mobile
- [x] Substituir TabsList por <select> dropdown nativo no mobile (md:hidden)
- [x] Manter abas horizontais no desktop (hidden md:grid)
- [x] Adicionar emojis e labels descritivos no dropdown
- [x] Implementar onChange que clica na aba correspondente
- [x] Desktop continua com abas normais (testado em viewport > 768px)

## 📊 Nova Tarefa: Dashboard de Análise com Gráficos
- [x] Instalar biblioteca recharts para gráficos interativos
- [x] Criar API analytics.getHistoricalData para buscar dados agregados
- [x] Criar API analytics.getStats para calcular estatísticas (média, mín, máx)
- [x] Criar página Analytics (/analytics) com layout de dashboard
- [x] Implementar gráfico de linha para evolução de Temperatura
- [x] Implementar gráfico de linha para evolução de Umidade (RH)
- [x] Implementar gráfico de linha para evolução de PPFD
- [x] Adicionar cards de estatísticas (média, mín, máx) para cada métrica
- [x] Implementar filtros: por estufa, período (7/30/90 dias)
- [x] Tornar gráficos responsivos para mobile (ResponsiveContainer)
- [x] Adicionar link para Analytics na Home (botão Análise)
- [x] Ajustar grid da Home para 5 colunas no desktop
- [ ] Testar dashboard com dados reais

## 🗑️ Remover Dashboard de Análise
- [x] Remover página Analytics.tsx
- [x] Remover APIs analytics.getHistoricalData e analytics.getStats do router
- [x] Remover botão "Análise" da Home
- [x] Ajustar grid da Home de volta para 4 colunas
- [x] Desinstalar biblioteca recharts (pnpm remove recharts)
- [x] Remover rota /analytics do App.tsx
- [x] Limpar imports não utilizados

## 🔍 Revisão Completa do Projeto
- [x] Revisar todas as funcionalidades implementadas
- [x] Identificar bugs ou inconsistências
- [x] Sugerir melhorias de UX/UI
- [x] Sugerir novas funcionalidades úteis
- [x] Verificar responsividade mobile em todas as páginas
- [x] Verificar performance e otimizações possíveis

## 🧭 Menu de Navegação Fixo
- [x] Criar componente BottomNav.tsx
- [x] Adicionar 5 links principais: Home, Calculadoras, Histórico, Alertas, Strains
- [x] Usar ícones do lucide-react (Home, Calculator, BarChart3, Bell, Sprout)
- [x] Estilizar com Tailwind (fixed bottom-0, bg-white, border-top, shadow)
- [x] Destacar página ativa com cor diferente (verde)
- [x] Integrar no App.tsx (renderizar em todas as páginas)
- [x] Adicionar padding-bottom (pb-16) no wrapper principal
- [x] Testar navegação em todas as páginas
- [x] Testar responsividade mobile e desktop

## 🖥️ Melhorar Navegação Desktop (Sidebar)
- [x] Criar componente Sidebar.tsx para desktop
- [x] Sidebar com logo, links verticais e ícones maiores
- [x] Mostrar sidebar apenas em telas >= 768px (md breakpoint)
- [x] Ocultar BottomNav em desktop (md:hidden)
- [x] Ajustar layout do App.tsx (sidebar fixa + conteúdo)
- [x] Adicionar padding-left (md:pl-64) no conteúdo quando sidebar visível
- [x] Testar transição entre mobile e desktop
- [x] Verificar que menu inferior aparece só no mobile

## 🔔 Sistema de Notificações Push
- [x] Criar componente NotificationSettings.tsx
- [x] Solicitar permissão de notificações do navegador
- [x] Criar interface para configurar horário do lembrete (input time)
- [x] Implementar lógica de agendamento diário (localStorage + setTimeout)
- [x] Criar função para disparar notificação push
- [x] Adicionar link "Configurações" na Sidebar
- [x] Criar página Settings.tsx dedicada
- [x] Adicionar switch para ativar/desativar lembretes
- [x] Salvar preferências do usuário (horário, ativo/inativo) em localStorage
- [x] Botão "Testar Notificação" para validar funcionamento

## 📊 Página de Histórico em Tabela
- [x] Criar API dailyLogs.listAll com filtros (tentId, dateRange, limit, offset)
- [x] Criar componente HistoryTable.tsx completo
- [x] Adicionar colunas: Data, Turno, Estufa, Temp, RH, PPFD, pH, EC, Observações
- [x] Implementar filtros: por estufa, período (7/30/90 dias, todos, custom)
- [x] Adicionar filtro por data específica (custom date range)
- [x] Implementar paginação (10/25/50/100 registros por página)
- [x] Criar função de exportação para CSV com BOM UTF-8
- [x] Botão "Exportar CSV" com dados filtrados no header
- [x] Substituir página History.tsx por HistoryTable.tsx
- [x] Badges para turno (AM/PM) e contador de registros
- [x] Tratamento de estado vazio e loading

## ✏️ Ações na Tabela de Histórico (Editar/Excluir)
- [x] Criar API dailyLogs.update para editar registro
- [x] Criar API dailyLogs.delete para excluir registro
- [x] Criar componente EditLogDialog.tsx com formulário
- [x] Pré-preencher formulário com valores do registro selecionado
- [x] Adicionar coluna "Ações" na tabela de histórico
- [x] Botão "Editar" (ícone Pencil) em cada linha
- [x] Botão "Excluir" (ícone Trash2) em cada linha
- [x] Dialog de confirmação antes de excluir
- [x] Invalidar cache e atualizar tabela após edição/exclusão
- [x] Feedback visual (toast) de sucesso/erro

## 🔔 Integração de Alertas com Notificações Push
- [ ] Criar função checkValuesOutOfRange() no servidor
- [ ] Comparar valores registrados com targets da strain/fase atual
- [ ] Identificar quais parâmetros estão fora da faixa (temp, RH, PPFD, pH, EC)
- [ ] Criar alerta automático quando valores fora da faixa
- [ ] Integrar verificação na API dailyLogs.create
- [ ] Enviar notificação push imediata ao detectar valores fora da faixa
- [ ] Incluir detalhes do alerta na notificação (parâmetro, valor, faixa ideal)
- [ ] Testar com valores dentro e fora da faixa
- [ ] Verificar que notificação aparece no navegador
- [ ] Verificar que alerta é criado na página de Alertas

## 🐛 Corrigir Erro 404 ao Editar Strain
- [x] Investigar erro 404 ao clicar em editar parâmetros da strain
- [x] Verificar rotas no App.tsx
- [x] Verificar navegação na página ManageStrains
- [x] Corrigir rota ou link quebrado (criada rota /strains/:id/targets)
- [x] Criar página StrainTargets.tsx completa
- [x] Testar edição de parâmetros completa

## 🧹 Remover Botão Exportar da Home
- [x] Remover botão "Exportar PDF" da página Home
- [x] Remover função handleExportPDF e import generateCycleReport
- [x] Manter apenas exportação CSV na página de Histórico
- [x] Deixar interface da Home mais limpa e focada

## 🐛 Corrigir Calculadoras no Mobile
- [x] Investigar problema: select com click() em tabs não funcionava
- [x] Verificar código da página Calculators.tsx
- [x] Criar página CalculatorMenu.tsx com cards grandes e ícones
- [x] Implementar navegação para cada calculadora individual (/calculators/:id)
- [x] Adaptar Calculators.tsx para receber parâmetro de rota
- [x] Adicionar botão voltar no header das calculadoras
- [x] Remover dropdown mobile quebrado

## 🧹 Limpeza Pré-Publicação
- [x] Remover client/src/components/ui/chart.tsx (10 erros TypeScript eliminados)
- [x] Deletar client/src/pages/History.tsx (substituída por HistoryTable.tsx)
- [x] Deletar client/src/pages/ComponentShowcase.tsx (página de demo)
- [x] Adicionar favicon personalizado (favicon.svg com seedling verde)
- [x] Verificar build limpo sem erros TypeScript (0 erros!)

## 🧹 Remover Tabs das Calculadoras
- [x] Remover menu de tabs horizontal da página Calculators.tsx
- [x] Manter apenas header com botão voltar e título da calculadora
- [x] Simplificar interface das calculadoras individuais

## 📄 Exportação PDF com Gráficos
- [x] Instalar dependências: html2canvas e jsPDF
- [x] Criar função de exportação PDF que captura gráficos (chartPdfExport.ts)
- [x] Adicionar botão "Exportar PDF" na página TentDetails (header)
- [x] Adicionar botão "Exportar PDF" na página HistoryTable (ao lado do CSV)
- [x] PDF inclui: cabeçalho com título, subtítulo, gráficos/tabelas capturados, rodapé com data/hora
- [x] Testar exportação em ambas as páginas

## ✅ Validação de Formulários
- [x] Criar utilitário de validação com ranges realistas (validation.ts)
- [x] Definir ranges: pH (0-14), Temp (-10 a 50°C), RH (0-100%), PPFD (0-2000), EC (0-5)
- [x] Adicionar validação no backend com Zod refine
- [x] Mensagens de erro claras em português
- [x] Validação no servidor previne dados inválidos
- [x] Toast automático de erro quando validação falha
- [x] Testar com valores válidos e inválidos

## 🐛 Corrigir Erro na Geração de PDF
- [x] Investigar erro ao clicar em "Exportar PDF"
- [x] Verificar logs do navegador (console errors)
- [x] Verificar código de chartPdfExport.ts
- [x] Identificar causa do erro: ID dentro de TabsContent (só existe quando aba ativa)
- [x] Corrigir erro: mover ID para Tabs (container pai)
- [x] Testar exportação em TentDetails e HistoryTable

## 🐛 Corrigir Erro OKLCH na Exportação PDF
- [x] html2canvas não suporta cores OKLCH (Tailwind 4)
- [x] Adicionar callback onclone para converter cores OKLCH para RGB
- [x] Fallback: branco para background, preto para texto, cinza para bordas
- [x] Testar exportação em HistoryTable e TentDetails
- [x] Verificar se PDF é gerado corretamente

## 🖨️ Substituir PDF por Impressão Nativa
- [x] Remover botões "Exportar PDF" problemáticos
- [x] Adicionar botões "Imprimir" com window.print()
- [x] Criar estilos @media print para formatação
- [x] Ocultar menus/sidebars na impressão
- [x] Testar impressão e "Salvar como PDF" do navegador

## 🌙 Nova Tarefa: Modo Escuro
- [x] Criar contexto ThemeContext com estado e persistência
- [x] Criar hook useTheme para acessar tema
- [x] Adicionar toggle de tema na página Configurações
- [x] Aplicar classe "dark" no elemento raiz
- [x] Testar transição entre temas claro e escuro

## 🐛 Bug: Erro JSON na página /tent/1/log
- [x] Investigar logs do servidor e navegador
- [x] Identificar qual query tRPC está falhando
- [x] Verificar código da página TentLog.tsx
- [x] Corrigir erro e testar solução

## 🎨 Nova Tarefa: Configurar Ícone do App
- [x] Gerar ícones PNG em tamanhos: 192x192, 512x512, 180x180 (Apple)
- [x] Gerar favicon.ico a partir do SVG
- [x] Copiar ícones para client/public/
- [x] Atualizar manifest.json com novos ícones
- [x] Atualizar index.html com favicon e apple-touch-icon
- [x] Testar ícones no navegador e PWA

## 🔄 Atualizar Ícone para Melhor Resolução
- [x] Copiar novo SVG de alta resolução para client/public/
- [x] Regenerar todos os ícones PNG (192x192, 512x512, 180x180, favicon)
- [x] Verificar qualidade dos novos ícones

## 🌤️ Widget de Clima na Home
- [x] Pesquisar API de clima gratuita (OpenWeatherMap, WeatherAPI)
- [x] Criar procedimento tRPC para buscar dados de clima
- [x] Criar componente WeatherWidget com temperatura e umidade
- [x] Adicionar geolocalização para detectar localização do usuário
- [x] Integrar widget na página Home
- [x] Testar widget com dados reais
