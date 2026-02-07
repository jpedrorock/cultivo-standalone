# 📝 Changelog - App Cultivo

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

---

## [1.0.0] - 2026-02-07

### 🎉 Lançamento Inicial

**Funcionalidades Principais:**

### 🏠 Gerenciamento de Estufas
- ✅ Criar, editar e visualizar múltiplas estufas
- ✅ Definir dimensões (largura × altura × profundidade)
- ✅ Tipos de estufa (A, B, C)
- ✅ Status ativo/inativo

### 🔄 Ciclos de Cultivo
- ✅ 4 fases: Clonagem, Manutenção, Vegetativa, Floração
- ✅ Gerenciamento de semanas (1-12)
- ✅ Iniciar, editar e finalizar ciclos
- ✅ Seletor de fase inicial ao criar estufa
- ✅ Histórico de ciclos completados

### 📝 Registro Diário
- ✅ Registro de parâmetros 2x/dia (AM/PM)
- ✅ Temperatura (°C)
- ✅ Umidade Relativa (%)
- ✅ PPFD (μmol/m²/s)
- ✅ Campo de observações

### ✅ Tarefas Semanais
- ✅ Checklist por estufa e semana
- ✅ Templates de tarefas por fase
- ✅ Contador de progresso (ex: 2/5)
- ✅ Tarefas específicas por contexto (Tent A vs Tent B/C)

### 🧮 Calculadoras
1. **Lux ↔ PPFD**
   - ✅ Conversão bidirecional
   - ✅ 5 tipos de luz (LED Branco, HPS, MH, CMH, LED Full Spectrum)
   - ✅ Slider visual com gradiente colorido
   - ✅ Indicadores de fase (Clonagem, Veg, Flora, Máximo)
   - ✅ Precisão: step 10 (PPFD), step 1000 (Lux)

2. **PPM ↔ EC**
   - ✅ Conversão bidirecional
   - ✅ 3 escalas (500, 640, 700)
   - ✅ Referências por fase

3. **Ajuste de pH**
   - ✅ Cálculo de ácido/base necessário
   - ✅ Volume de água (litros)
   - ✅ pH atual → pH alvo
   - ✅ Referências por substrato

4. **Fertilização Inteligente**
   - ✅ Cálculo de micronutrientes (Ca, Mg, Fe)
   - ✅ Ajuste por volume de rega
   - ✅ Ajuste por fase (Vegetativa/Floração)
   - ✅ Ícones específicos por nutriente
   - ✅ Barras de progresso de concentração
   - ✅ Seções expansíveis de sintomas de deficiência
   - ✅ Tooltips informativos

5. **Conversores Rápidos**
   - ✅ Temperatura (°C ↔ °F)
   - ✅ Volume (L ↔ Gal)
   - ✅ Peso (g ↔ oz)

### 📊 Histórico e Análise
- ✅ Tabela completa de registros
- ✅ Filtros por estufa, data, turno
- ✅ Exportar para CSV
- ✅ Paginação

### 🌿 Strains (Variedades)
- ✅ Cadastro de strains
- ✅ Tipos: Indica, Sativa, Híbrida
- ✅ Targets por fase (Temp, RH, PPFD)
- ✅ Strain padrão pré-configurada

### 🔔 Alertas
- ✅ Detecção de desvios de parâmetros
- ✅ Alertas de tarefas pendentes
- ✅ Marcar como visto
- ✅ Contador de alertas novos

### ⚙️ Configurações
- ✅ Modo Claro / Escuro
- ✅ Tema escuro profissional com sidebar quase preta
- ✅ Todas as cores respeitam tema selecionado
- ✅ Scrollbars ocultas

### 🗄️ Banco de Dados
- ✅ Suporte a **MySQL** (produção)
- ✅ Suporte a **SQLite** (desenvolvimento local)
- ✅ Detecção automática de banco disponível
- ✅ Banco inicial pré-populado com dados de exemplo

### 📦 Distribuição
- ✅ Pacote completo para uso independente
- ✅ GUIA-COMPLETO.md (manual detalhado)
- ✅ QUICK-START.md (guia rápido 5 min)
- ✅ README-LOCAL.md (setup local)
- ✅ banco-inicial.sql (dados de exemplo)
- ✅ setup-local.sh (script de configuração)
- ✅ .env.example (template de variáveis)

### 🎨 Design e UX
- ✅ Interface moderna com Tailwind CSS 4
- ✅ Componentes shadcn/ui
- ✅ Modo escuro profissional
- ✅ Responsivo (desktop e mobile)
- ✅ Ícones Lucide React
- ✅ Gradientes e animações sutis
- ✅ Cards coloridos por contexto

### 🔧 Tecnologias
- ✅ **Frontend:** React 19, Vite, Tailwind CSS 4
- ✅ **Backend:** Node.js, Express, tRPC 11
- ✅ **Database:** MySQL/TiDB (Manus) ou SQLite (local)
- ✅ **ORM:** Drizzle ORM
- ✅ **Type Safety:** TypeScript, Superjson
- ✅ **Routing:** Wouter (client-side)

---

## [Futuro] - Planejado

### 🚀 Próximas Funcionalidades

**Alta Prioridade:**
- 📊 Dashboard de análise com gráficos
- 📧 Sistema de alertas por email/SMS
- 📈 Gráficos de evolução temporal
- 🔄 Comparação de produtividade entre ciclos
- 🌐 Calculadora de DLI (Daily Light Integral)

**Média Prioridade:**
- 💾 Sistema de backup automático
- 📱 Modo offline-first (Service Workers)
- 🔐 Sistema de autenticação multi-usuário
- 🌍 Internacionalização (i18n)
- 📸 Upload de fotos das plantas

**Baixa Prioridade:**
- 🤖 Integração com sensores IoT
- 🔔 Notificações push
- 📱 App mobile nativo
- 🎮 Gamificação (conquistas, níveis)

---

## 📄 Formato do Changelog

Este changelog segue o padrão [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

### Tipos de Mudanças

- **Added** (Adicionado) - Novas funcionalidades
- **Changed** (Modificado) - Mudanças em funcionalidades existentes
- **Deprecated** (Obsoleto) - Funcionalidades que serão removidas
- **Removed** (Removido) - Funcionalidades removidas
- **Fixed** (Corrigido) - Correções de bugs
- **Security** (Segurança) - Correções de vulnerabilidades

---

**Desenvolvido com ❤️ para cultivadores**
