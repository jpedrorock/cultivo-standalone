#!/bin/bash

# ============================================
# App Cultivo - Instalador Completo
# ============================================
# Verifica e instala todas as dependências automaticamente

set -e  # Exit on error

echo "🌱 ============================================"
echo "🌱   App Cultivo - Instalador Automático"
echo "🌱 ============================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Detectar plataforma
OS_TYPE=$(uname -s)
ARCH_TYPE=$(uname -m)
print_info "Plataforma: $OS_TYPE $ARCH_TYPE"
echo ""

# 1. Verificar Node.js
echo "📋 Verificando requisitos do sistema..."
echo ""

if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado!"
    echo ""
    echo "Por favor, instale Node.js 18 ou superior:"
    echo "  • macOS: brew install node"
    echo "  • Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  • Windows: https://nodejs.org/"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versão muito antiga: $(node -v)"
    echo "É necessário Node.js 18 ou superior"
    exit 1
fi

print_success "Node.js $(node -v) detectado"

# 2. Verificar/Instalar pnpm
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm não encontrado. Instalando..."
    npm install -g pnpm
    if [ $? -eq 0 ]; then
        print_success "pnpm instalado com sucesso"
    else
        print_error "Falha ao instalar pnpm"
        exit 1
    fi
else
    print_success "pnpm $(pnpm -v) detectado"
fi

echo ""
echo "📦 Instalando dependências do projeto..."
echo "   (Isso pode levar alguns minutos...)"
echo ""

# 3. Instalar dependências
if ! pnpm install; then
    print_error "Falha ao instalar dependências!"
    echo ""
    echo "Tente rodar manualmente:"
    echo "  pnpm install"
    echo ""
    exit 1
fi

print_success "Dependências instaladas"

# 3.5. Recompilar módulos nativos (better_sqlite3)
echo ""
print_info "Recompilando módulos nativos para seu sistema..."
if pnpm rebuild better-sqlite3 2>/dev/null; then
    print_success "Módulos nativos recompilados"
else
    print_warning "Não foi possível recompilar better-sqlite3"
    print_info "Tentando reinstalação completa..."
    rm -rf node_modules
    if pnpm install; then
        print_success "Reinstalação concluída"
    else
        print_error "Falha na reinstalação"
        exit 1
    fi
fi

# 4. Verificar se drizzle-kit está disponível
echo ""
echo "🔍 Verificando ferramentas de banco de dados..."

if ! pnpm exec drizzle-kit --version &> /dev/null; then
    print_error "drizzle-kit não encontrado após instalação!"
    echo "Reinstalando dependências..."
    pnpm install --force
fi

print_success "drizzle-kit disponível"

# 5. Criar arquivo .env
echo ""
echo "⚙️  Configurando ambiente..."

if [ -f .env ]; then
    print_warning "Arquivo .env já existe"
    read -p "Deseja sobrescrever? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        print_info "Mantendo .env existente"
    else
        rm .env
    fi
fi

if [ ! -f .env ]; then
    cat > .env << 'EOF'
# Banco de dados SQLite (local)
DATABASE_URL="file:./local.db"

# Configuração do app
VITE_APP_TITLE="App Cultivo"
VITE_APP_LOGO="/logo.svg"
PORT=3000
NODE_ENV="development"

# Auth desabilitado (uso local)
JWT_SECRET=""
OAUTH_SERVER_URL=""
VITE_OAUTH_PORTAL_URL=""
VITE_APP_ID=""
OWNER_OPEN_ID=""
OWNER_NAME=""

# Storage local (sem S3)
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""

# IA desabilitada (sem LLM)
# BUILT_IN_FORGE_API_URL=""
# BUILT_IN_FORGE_API_KEY=""
# VITE_FRONTEND_FORGE_API_URL=""
# VITE_FRONTEND_FORGE_API_KEY=""
EOF
    print_success "Arquivo .env criado"
else
    print_info "Usando .env existente"
fi

# 6. Preparar banco de dados
echo ""
echo "🗄️  Configurando banco de dados SQLite..."

# Remover banco antigo se existir
if [ -f local.db ]; then
    print_warning "Banco de dados existente encontrado"
    read -p "Deseja recriá-lo? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        rm -f local.db
        print_info "Banco de dados removido"
    else
        print_info "Mantendo banco existente"
    fi
fi

# 7. Criar banco de dados e importar dados
echo ""
echo "📊 Criando banco de dados SQLite..."
echo "   (Criando tabelas e importando dados...)"
echo ""

# Verificar se sqlite3 está disponível
if ! command -v sqlite3 &> /dev/null; then
    print_error "❌ ERRO CRÍTICO: sqlite3 não encontrado!"
    echo ""
    echo "O instalador precisa do sqlite3 para criar o banco de dados."
    echo ""
    echo "Instale sqlite3:"
    echo "  macOS:   brew install sqlite3"
    echo "  Ubuntu:  sudo apt-get install sqlite3"
    echo "  Windows: https://www.sqlite.org/download.html"
    echo ""
    exit 1
fi

# Remover banco antigo se existir e criar novo
if [ -f local.db ]; then
    print_warning "Banco de dados existente encontrado"
    read -p "Deseja recriá-lo? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        rm -f local.db
        print_info "Banco de dados removido"
    else
        print_info "Mantendo banco existente (pulando importação)"
        SKIP_IMPORT=true
    fi
fi

# Importar schema + dados
if [ "$SKIP_IMPORT" != "true" ] && [ -f banco-inicial.sql ]; then
    if sqlite3 local.db < banco-inicial.sql 2>&1; then
        print_success "Banco de dados criado com sucesso!"
        print_info "   • 3 estufas (A, B, C)"
        print_info "   • 6 strains cadastradas"
        print_info "   • 6 ciclos (ativos e finalizados)"
        print_info "   • Registros diários e tarefas"
    else
        print_error "Erro ao criar banco de dados"
        echo ""
        echo "Tente manualmente:"
        echo "  sqlite3 local.db < banco-inicial.sql"
        echo ""
        exit 1
    fi
else
    if [ ! -f banco-inicial.sql ]; then
        print_warning "banco-inicial.sql não encontrado"
        print_info "Banco será criado vazio"
    fi
fi

print_success "Banco de dados configurado"

# 8. Testar conexão do banco
echo ""
echo "🔍 Testando conexão do banco de dados..."

if [ -f local.db ]; then
    DB_SIZE=$(du -h local.db | cut -f1)
    print_success "Banco de dados OK (tamanho: $DB_SIZE)"
    
    # Contar tabelas
    if command -v sqlite3 &> /dev/null; then
        TABLE_COUNT=$(sqlite3 local.db "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "0")
        print_info "Tabelas criadas: $TABLE_COUNT"
    fi
else
    print_error "Banco de dados não foi criado!"
    exit 1
fi

# 10. Resumo final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_success "Instalação concluída com sucesso!"
echo ""
echo "📋 Resumo:"
echo "  • Node.js: $(node -v)"
echo "  • pnpm: $(pnpm -v)"
echo "  • Banco: local.db ($DB_SIZE)"
echo "  • Porta: 3000"
echo ""
echo "🚀 Para iniciar o servidor de desenvolvimento:"
echo ""
echo "     pnpm dev"
echo ""
echo "🌐 O app estará disponível em:"
echo ""
echo "     http://localhost:3000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
