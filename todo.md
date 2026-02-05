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
