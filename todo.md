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
