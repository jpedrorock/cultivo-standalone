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
