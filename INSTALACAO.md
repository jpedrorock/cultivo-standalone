# 🌱 App Cultivo - Guia de Instalação e Uso

**Sistema Completo de Gerenciamento de Estufas de Cultivo**

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Requisitos do Sistema](#requisitos-do-sistema)
3. [Instalação](#instalação)
4. [Configuração Inicial](#configuração-inicial)
5. [Funcionalidades Principais](#funcionalidades-principais)
6. [Atalhos de Teclado](#atalhos-de-teclado)
7. [Backup e Restauração](#backup-e-restauração)
8. [Suporte e Documentação](#suporte-e-documentação)

---

## 🎯 Visão Geral

O **App Cultivo** é um sistema web completo para gerenciamento profissional de estufas de cultivo. Permite monitorar múltiplas estufas simultaneamente, registrar medições ambientais (temperatura, umidade, PPFD), gerenciar ciclos de crescimento, acompanhar tarefas semanais e analisar histórico de dados.

### Principais Características

- ✅ **Gerenciamento Multi-Estufa**: Controle até 3 estufas simultaneamente
- ✅ **Ciclos Personalizados**: Acompanhe fases vegetativa, floração, secagem e manutenção
- ✅ **Registro de Medições**: AM/PM com indicadores visuais intuitivos
- ✅ **Tarefas Semanais**: Checklists automáticos por fase do ciclo
- ✅ **Calculadoras**: Conversão Lux ↔ PPFD, DLI, VPD
- ✅ **Histórico Completo**: Visualize todas as medições e observações
- ✅ **Alertas Inteligentes**: Notificações para desvios de parâmetros
- ✅ **Backup/Restauração**: Exportação e importação de banco de dados SQL
- ✅ **Atalhos de Teclado**: Navegação rápida e produtiva
- ✅ **Responsivo**: Interface otimizada para desktop, tablet e celular

---

## 💻 Requisitos do Sistema

### Servidor (Produção)

- **Node.js**: 22.x ou superior
- **Banco de Dados**: MySQL 8.0+ ou TiDB compatível
- **Memória RAM**: Mínimo 512MB
- **Armazenamento**: 1GB livre
- **Rede**: Conexão estável à internet

### Cliente (Navegador)

- **Navegadores Suportados**:
  - Chrome/Edge 90+
  - Firefox 88+
  - Safari 14+
  - Opera 76+
- **Resolução Mínima**: 360x640 (mobile) ou 1280x720 (desktop)
- **JavaScript**: Habilitado
- **Cookies**: Habilitados (para autenticação)

---

## 🚀 Instalação

### Opção 1: Deploy Automático (Manus Platform)

**Recomendado para usuários finais**

1. Acesse o painel Manus: https://manus.im
2. Clique em "Publish" no projeto `cultivo-architecture-docs`
3. Aguarde o deploy automático (2-3 minutos)
4. Acesse o domínio gerado: `https://seu-app.manus.space`

### Opção 2: Instalação Manual

**Para desenvolvedores ou self-hosting**

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/cultivo-architecture-docs.git
cd cultivo-architecture-docs

# 2. Instale dependências
pnpm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais de banco de dados

# 4. Execute migrações do banco
pnpm db:push

# 5. Inicie o servidor de desenvolvimento
pnpm dev

# 6. Acesse http://localhost:3000
```

### Variáveis de Ambiente Necessárias

```env
# Banco de Dados
DATABASE_URL=mysql://usuario:senha@host:3306/cultivo_db

# Servidor
PORT=3000
NODE_ENV=production

# Base URL para arquivos (IMPORTANTE: Altere para seu domínio em produção)
# Exemplos:
#   Desenvolvimento: http://localhost:3000
#   Produção: https://cultivo.seudominio.com
BASE_URL=http://localhost:3000

# JWT Secret (gere uma string aleatória para produção)
JWT_SECRET=sua_chave_secreta_aqui

# Aplicação
VITE_APP_TITLE=App Cultivo
VITE_APP_LOGO=/logo.png
```

**⚠️ IMPORTANTE sobre BASE_URL:**
- Define onde as fotos serão acessíveis
- Em desenvolvimento: use `http://localhost:3000`
- Em produção: use seu domínio real (ex: `https://cultivo.seudominio.com`)
- Não inclua barra final (`/`) no final da URL

---

## ⚙️ Configuração Inicial

### 1. Primeiro Acesso

1. Acesse o aplicativo pelo navegador (http://localhost:3000)
2. Você será automaticamente direcionado para a página inicial
3. O app funciona sem autenticação (standalone)

### 2. Criar Primeira Estufa

1. Na página inicial, clique em **"Criar Nova Estufa"** (ou pressione `Ctrl+N`)
2. Preencha os dados:
   - **Nome**: Ex: "Estufa A"
   - **Tipo**: A, B ou C
   - **Dimensões**: Largura × Profundidade × Altura (cm)
   - **Potência da Luz**: Watts totais
3. Clique em "Criar Estufa"

### 3. Iniciar Primeiro Ciclo

1. No card da estufa criada, clique em **"Novo Ciclo"**
2. Configure:
   - **Strain**: Selecione a variedade (ou use "Padrão")
   - **Fase Inicial**: Vegetativa, Floração, Secagem ou Manutenção
   - **Semana Atual**: Semana do ciclo (1-12)
   - **Data de Início**: Data de início do ciclo
3. Clique em "Iniciar Ciclo"

### 4. Registrar Primeira Medição

1. Clique em **"Registrar"** no card da estufa
2. Selecione o período: **AM** (manhã) ou **PM** (noite)
3. Preencha as medições:
   - Temperatura (°C)
   - Umidade Relativa (%)
   - PPFD (µmol/m²/s)
   - Fotoperíodo (horas)
   - pH
   - EC (mS/cm)
   - Volume de água (L)
4. Adicione observações (opcional)
5. Clique em "Salvar Registro" (ou pressione `Ctrl+S`)

---

## 🎯 Funcionalidades Principais

### 📊 Dashboard (Home)

**Visão geral de todas as estufas**

- Cards individuais por estufa mostrando:
  - Fase atual e semana do ciclo
  - Data de início
  - Tarefas da semana (checklist)
  - Última medição (Temp, RH, PPFD)
- Botões de ação rápida:
  - **Novo Ciclo**: Iniciar novo ciclo
  - **Ver Detalhes**: Histórico completo
  - **Registrar**: Nova medição
  - **Editar Ciclo**: Alterar fase/semana
  - **Finalizar Ciclo**: Encerrar ciclo atual
  - **Excluir Estufa**: Remover estufa (apenas sem ciclo ativo)

### 📝 Registro de Medições

**Página dedicada para registro de dados**

- **Indicador Visual AM/PM**:
  - **AM** (Manhã): Fundo amarelo claro com ícone de sol
  - **PM** (Noite): Fundo roxo escuro com ícone de lua
- **Valores de Referência**: Targets ideais da semana atual
- **Campos de Medição**:
  - Temperatura, Umidade, PPFD, Fotoperíodo, pH, EC, Volume
- **Observações**: Campo de texto livre para anotações
- **Histórico Recente**: Últimas 5 medições

### 🧮 Calculadoras

**Ferramentas de conversão e cálculo**

#### 1. Calculadora Lux ↔ PPFD

- **Modo Lux → PPFD**: Para quem tem luxímetro
- **Modo PPFD → Lux**: Para quem tem medidor PPFD
- Suporta 5 tipos de luz:
  - LED Branco
  - LED Full Spectrum
  - HPS (Alta Pressão de Sódio)
  - MH (Metal Halide)
  - Luz Solar

#### 2. Calculadora DLI

- Calcule Daily Light Integral (mol/m²/dia)
- Baseado em PPFD e fotoperíodo

#### 3. Calculadora VPD

- Calcule Vapor Pressure Deficit (kPa)
- Baseado em temperatura e umidade relativa

### 📈 Histórico

**Visualização completa de dados históricos**

- Filtros por:
  - Estufa
  - Período (data inicial/final)
  - Tipo de medição
- Tabela com todas as medições:
  - Data/hora
  - Período (AM/PM)
  - Todos os parâmetros
  - Observações
- Exportação para CSV (futuro)

### 🔔 Alertas

**Sistema de notificações inteligentes**

- Alertas automáticos para:
  - Temperatura fora da faixa ideal
  - Umidade fora da faixa ideal
  - PPFD abaixo do target
  - Tarefas pendentes da semana
- Configuração de thresholds personalizados
- Notificações por email (futuro)

### 🌿 Strains

**Gerenciamento de variedades**

- Cadastro de strains personalizadas
- Configuração de targets por fase:
  - Temperatura ideal (min/max)
  - Umidade ideal (min/max)
  - PPFD ideal
  - Fotoperíodo recomendado
- Associação de strains a ciclos

### ⚙️ Configurações

**Painel de configuração do sistema**

- **Atalhos de Teclado**: Lista completa de atalhos
- **Backup do Banco de Dados**:
  - Exportar banco completo (SQL)
  - Importar backup anterior
- **Informações do Sistema**:
  - Versão do aplicativo
  - Estatísticas de uso

---

## ⌨️ Atalhos de Teclado

**Navegação rápida e produtiva**

| Atalho | Ação | Contexto |
|--------|------|----------|
| `Ctrl+N` | Criar Nova Estufa | Global |
| `Ctrl+S` | Salvar Registro | Página de Registro |
| `Ctrl+H` | Ir para Histórico | Global |
| `Ctrl+C` | Ir para Calculadoras | Global |
| `Ctrl+/` | Mostrar Atalhos | Global |
| `Esc` | Fechar Modal | Modais abertos |

**Nota**: Os atalhos não funcionam quando você está digitando em campos de texto.

---

## 💾 Backup e Restauração

### Exportar Backup

1. Acesse **Configurações** (menu lateral)
2. Localize o card **"Backup do Banco de Dados"**
3. Clique em **"Exportar Banco de Dados"**
4. O arquivo SQL será baixado automaticamente:
   - Nome: `cultivo-backup-YYYY-MM-DD.sql`
   - Contém: Todas as tabelas, dados e estrutura

### Importar Backup

1. Acesse **Configurações** (menu lateral)
2. Localize o card **"Importar Backup do Banco de Dados"**
3. Clique em **"Choose File"** e selecione o arquivo `.sql`
4. Clique em **"Importar Banco de Dados"**
5. **⚠️ AVISO**: A importação irá **sobrescrever todos os dados existentes**
6. Confirme a operação

**Recomendação**: Faça backups semanais e antes de grandes mudanças.

---

## 📱 Uso Mobile

### Instalação como PWA (Progressive Web App)

**Android (Chrome/Edge)**

1. Acesse o aplicativo pelo navegador
2. Toque no menu (⋮) → "Adicionar à tela inicial"
3. Confirme a instalação
4. O app aparecerá como ícone na tela inicial

**iOS (Safari)**

1. Acesse o aplicativo pelo Safari
2. Toque no botão de compartilhar (□↑)
3. Role e toque em "Adicionar à Tela de Início"
4. Confirme a instalação

### Recursos Offline

- ✅ Interface carregada localmente
- ✅ Cache de dados recentes
- ❌ Registro de medições requer internet
- ❌ Sincronização automática quando online

---

## 🔧 Solução de Problemas

### Problema: Não consigo fazer login

**Solução**:
1. Verifique se os cookies estão habilitados
2. Limpe o cache do navegador
3. Tente em modo anônimo/privado
4. Verifique se não está usando Safari Private Browsing

### Problema: Medições não estão salvando

**Solução**:
1. Verifique conexão com internet
2. Verifique se todos os campos obrigatórios estão preenchidos
3. Tente recarregar a página (F5)
4. Verifique console do navegador (F12) para erros

### Problema: Backup não está sendo gerado

**Solução**:
1. Verifique se há dados no banco
2. Tente novamente após alguns segundos
3. Verifique espaço em disco
4. Contate o suporte se persistir

---

## 📚 Estrutura do Banco de Dados

### Tabelas Principais

- **`tents`**: Estufas cadastradas
- **`cycles`**: Ciclos de cultivo
- **`logs`**: Registros de medições
- **`strains`**: Variedades de plantas
- **`tasks`**: Tarefas semanais
- **`alerts`**: Alertas e notificações

### Relacionamentos

```
tents (1) ─── (N) cycles
cycles (1) ─── (N) logs
cycles (1) ─── (N) tasks
strains (1) ─── (N) cycles
```

---

## 🎨 Personalização

### Alterar Logo

1. Acesse **Configurações** → **Secrets**
2. Edite `VITE_APP_LOGO`
3. Insira URL da imagem (PNG/SVG, 512x512px recomendado)
4. Salve e recarregue a página

### Alterar Título

1. Acesse **Configurações** → **Secrets**
2. Edite `VITE_APP_TITLE`
3. Insira o novo título
4. Salve e recarregue a página

---

## 🤝 Suporte e Documentação

### Links Úteis

- **Documentação Completa**: [Em construção]
- **Repositório GitHub**: https://github.com/seu-usuario/cultivo-architecture-docs
- **Suporte Manus**: https://help.manus.im
- **Comunidade Discord**: [Em construção]

### Reportar Bugs

1. Acesse o repositório GitHub
2. Crie uma nova Issue
3. Descreva o problema detalhadamente:
   - Passos para reproduzir
   - Comportamento esperado vs. observado
   - Screenshots (se aplicável)
   - Navegador e versão

### Solicitar Funcionalidades

1. Acesse o repositório GitHub
2. Crie uma nova Issue com tag `enhancement`
3. Descreva a funcionalidade desejada
4. Explique o caso de uso

---

## 📄 Licença

Este projeto está sob licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ usando:

- **React 19** - Interface de usuário
- **Tailwind CSS 4** - Estilização
- **tRPC 11** - API type-safe
- **Drizzle ORM** - Banco de dados
- **Manus Platform** - Hospedagem e deploy

---

## 📊 Estatísticas do Projeto

- **Versão Atual**: 1.0.0
- **Última Atualização**: Fevereiro 2026
- **Linhas de Código**: ~15.000
- **Funcionalidades**: 25+
- **Testes Unitários**: 15+

---

## 🗺️ Roadmap

### Em Desenvolvimento

- [ ] Gráficos de evolução temporal
- [ ] Exportação de relatórios PDF
- [ ] Notificações push
- [ ] Modo escuro

### Planejado

- [ ] Integração com sensores IoT
- [ ] App mobile nativo (iOS/Android)
- [ ] Sistema de permissões multi-usuário
- [ ] API pública para integrações

---

**Última atualização**: 07/02/2026
**Versão do documento**: 2.0


---

## 📸 Armazenamento de Fotos

### Como Funciona

O app armazena fotos **localmente** no servidor, na pasta `uploads/`:

```
uploads/
├── plants/           # Fotos de plantas
├── health/           # Fotos de saúde
└── trichomes/        # Fotos de tricomas
```

### Configuração

1. **Criar diretório de uploads** (se não existir):
```bash
mkdir -p uploads/plants uploads/health uploads/trichomes
chmod 755 uploads
```

2. **Configurar BASE_URL** no arquivo `.env`:
```env
# Desenvolvimento
BASE_URL=http://localhost:3000

# Produção (use seu domínio real)
BASE_URL=https://cultivo.seudominio.com
```

### Backup de Fotos

**⚠️ IMPORTANTE**: As fotos NÃO são incluídas no backup JSON do banco de dados!

Para fazer backup completo:

```bash
# Backup do banco de dados
# (via interface: Configurações → Backup e Restauração → Exportar)

# Backup das fotos
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

Para restaurar:

```bash
# Restaurar banco de dados
# (via interface: Configurações → Backup e Restauração → Importar)

# Restaurar fotos
tar -xzf uploads-backup-20260220.tar.gz
```

### Requisitos de Espaço

- Cada foto: ~500KB - 2MB
- Estimativa: 100 fotos = ~100MB
- Recomendado: Mínimo 5GB livre para armazenamento

### Permissões

Certifique-se de que o usuário do Node.js tem permissão de escrita:

```bash
chown -R node:node uploads/
chmod -R 755 uploads/
```
