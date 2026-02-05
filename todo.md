# TODO - App Cultivo

## 🗄️ Banco de Dados
- [x] Criar schema completo com 13 tabelas
- [x] Configurar relacionamentos entre tabelas
- [x] Criar índices otimizados
- [x] Popular dados iniciais (estufas, limites de segurança)

## ⚙️ Backend - APIs
- [x] API de Estufas (CRUD)
- [x] API de Strains (CRUD)
- [x] API de Ciclos (criar, listar, atualizar)
- [x] API de Clonagem (Estufa A - iniciar/encerrar)
- [x] API de Registros Diários (criar, listar)
- [ ] API de Receitas (criar, listar, templates)
- [x] API de Tarefas (listar, marcar como concluída)
- [x] API de Alertas (listar, marcar como visto)
- [x] API de Padrões Semanais (CRUD)
- [ ] Lógica de cálculo de fase/semana atual
- [ ] Lógica de geração de alertas automáticos
- [ ] Job diário para encerrar clonagem

## 🎨 Frontend - Telas
- [x] Home (Painel com 3 cards de estufas)
- [x] Registro Diário (formulário manhã/noite)
- [ ] Página de detalhes da estufa
- [ ] Tarefas da Semana (checklist)
- [ ] Análise/Gráficos (temperatura, umidade, PPFD)
- [ ] Alertas (lista com filtros)
- [ ] Configurações Admin (protegido por PIN)
- [ ] CRUD de Strains
- [ ] Editor de Padrões Semanais
- [ ] Biblioteca de Receitas
- [ ] Gerenciamento de Ciclos

## 🧪 Testes
- [ ] Testes unitários do backend
- [ ] Testes de integração das APIs
- [ ] Testes de fluxos principais

## 📦 Deploy
- [ ] Configurar variáveis de ambiente
- [ ] Criar checkpoint final
- [ ] Deploy em produção

## 🆕 Novas Funcionalidades Solicitadas
- [x] Página de detalhes da estufa com histórico completo
- [x] Gráficos de evolução (temperatura, umidade, PPFD)
- [x] Filtros de período para visualização dos dados

## 🐛 Bugs Reportados
- [x] Corrigir erro "data is undefined" na API cycles.getByTent quando não há ciclo ativo

## 🚀 Nova Funcionalidade - Iniciar Ciclo
- [x] Adicionar botão "Iniciar Ciclo" nos cards das Estufas B e C (quando inativas)
- [x] Criar modal de configuração de ciclo com formulário
- [x] Implementar seleção de strain (dropdown)
- [x] Adicionar campos de data de início e durações das fases
- [x] Criar API para iniciar ciclo
- [x] Validar dados do formulário

## 🌸 Nova Funcionalidade - Iniciar Floração
- [x] Adicionar botão "Iniciar Floração" nos cards de estufas em fase vegetativa
- [x] Criar API para iniciar floração (atualizar floraStartDate no ciclo)
- [x] Atualizar interface após transição (badge muda para roxo "Floração")
- [x] Criar testes para a API de iniciar floração

## 🌿 Nova Funcionalidade - Gerenciamento de Strains
- [x] Criar página de listagem de strains com tabela
- [x] Adicionar formulário modal para criar strain
- [x] Implementar edição de strain existente
- [x] Adicionar confirmação para excluir strain
- [x] Criar APIs de update e delete para strains
- [x] Adicionar validação de formulário
- [x] Criar testes para as APIs de strains

## 🔗 Nova Funcionalidade - Link para Gerenciar Strains
- [x] Adicionar link "Gerenciar Strains" no card de Ações Rápidas da Home

## ✅ Nova Funcionalidade - Página de Tarefas Semanais
- [x] Criar página de tarefas com listagem por estufa
- [x] Listar tarefas automaticamente baseadas na fase/semana do ciclo ativo
- [x] Adicionar checkbox para marcar tarefas como concluídas
- [x] Criar API para marcar tarefa como concluída
- [x] Adicionar filtros por estufa
- [x] Mostrar progresso de conclusão das tarefas
