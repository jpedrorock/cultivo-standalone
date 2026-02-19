# Análise da Página Home

## Layout Atual

### Cabeçalho
- Logo "App Cultivo" + subtítulo "Gerenciamento de Estufas"
- Botão "Criar Nova Estufa" (canto superior direito)
- Badge "Sistema Ativo" (canto superior direito)

### Seção de Estufas (Cards)

**3 Estufas exibidas:**

1. **Estufa A** (Badge azul: Manutenção)
   - Tipo: 46×78×90cm
   - Ciclo Ativo: Semana 1 (19/02/2026)
   - Tarefas da Semana: 0/3 concluídas
   - Parâmetros médios (2 strains)
   - Ícones: Temp, RH, PPFD com valores
   - Botões: Ver Detalhes, Registrar, Editar Ciclo, Finalizar Ciclo

2. **Estufa B** (Badge verde: Vegetativa)
   - Tipo: 60×60×120cm
   - Ciclo Ativo: Semana 4 (19/02/2026)
   - Tarefas da Semana: 0/3 concluídas
   - Temp: 26.7°C, RH: 57.8%, PPFD: 567
   - Botões: Ver Detalhes, Registrar, Editar Ciclo, Finalizar Ciclo

3. **Estufa C** (Badge roxo: Floração)
   - Tipo: 60×120×150cm
   - Ciclo Ativo: Semana 6 (19/02/2026)
   - Tarefas da Semana: 0/3 concluídas
   - Temp: 25.8°C, RH: 40.1%, PPFD: 780
   - Botões: Ver Detalhes, Registrar, Editar Ciclo, Finalizar Ciclo

### Seção "Clima Externo"
- Widget de clima (carregando...)

### Seção "Ações Rápidas"
- Links para: Gerenciar Strains, Calculadoras, Histórico, Alertas

## Pontos Positivos ✅

1. **Cards de Estufa bem organizados** - Informações claras e hierarquizadas
2. **Badges de fase coloridos** - Identificação visual rápida (Manutenção/Vega/Flora)
3. **Parâmetros visuais** - Ícones de Temp/RH/PPFD facilitam leitura
4. **Ações rápidas** - Botões de ação bem posicionados

## Problemas Identificados ❌

### 1. **Tarefas da Semana sempre 0/3**
- Todas as estufas mostram "0/3" tarefas concluídas
- Não há indicação visual de quais tarefas estão pendentes
- **Sugestão**: Adicionar preview das tarefas pendentes ou link direto

### 2. **Clima Externo não carrega**
- Widget mostra apenas loading spinner
- **Sugestão**: Remover se não for funcional ou corrigir integração

### 3. **Botões redundantes**
- "Editar Ciclo" e "Finalizar Ciclo" sempre visíveis
- **Sugestão**: Mover para menu dropdown ou modal de detalhes

### 4. **Falta de indicadores de alertas**
- Não há indicação visual de alertas ativos por estufa
- **Sugestão**: Adicionar badge de alerta nos cards quando houver desvios

### 5. **Ações Rápidas genéricas**
- Links para páginas que já estão na Sidebar
- **Sugestão**: Substituir por ações contextuais (ex: "Preparar Nutrientes", "Registrar Rega")

## Melhorias Sugeridas 🚀

### Curto Prazo
1. **Adicionar badges de alertas** nos cards de estufa (vermelho/amarelo/verde)
2. **Remover seção "Clima Externo"** se não for funcional
3. **Simplificar botões de ação** - Usar dropdown para ações secundárias
4. **Mostrar preview de tarefas** - Expandir "Tarefas da Semana" para mostrar lista

### Médio Prazo
1. **Dashboard de alertas** - Widget mostrando resumo de alertas ativos
2. **Gráficos de tendência** - Miniatura de gráfico de Temp/RH nos cards
3. **Ações Rápidas contextuais** - Baseadas no estado atual (ex: "Aplicar Nutrientes Vega Semana 4")

### Longo Prazo
1. **Timeline de ciclos** - Visualização de histórico de ciclos por estufa
2. **Comparação de produtividade** - Métricas de yield entre ciclos
