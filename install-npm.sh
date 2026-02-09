#!/bin/bash

# ============================================
# App Cultivo - Instalador com NPM
# ============================================
# Este script usa NPM ao invés de PNPM para
# evitar problemas com build scripts bloqueados

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funções de print
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Banner
clear
echo "🌱 ============================================"
echo "🌱   App Cultivo - Instalador Automático (NPM)"
echo "🌱 ============================================"
echo ""

# 1. Detectar plataforma
PLATFORM=$(uname -s)
ARCH=$(uname -m)
print_info "Plataforma: $PLATFORM $ARCH"

# 2. Verificar Node.js
echo ""
echo "📋 Verificando requisitos do sistema..."
echo ""

if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado!"
    echo ""
    echo "Por favor, instale Node.js 18+ de:"
    echo "  https://nodejs.org/"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION detectado"

# 3. Verificar NPM
if ! command -v npm &> /dev/null; then
    print_error "npm não encontrado!"
    echo ""
    echo "npm geralmente vem com Node.js."
    echo "Reinstale Node.js de: https://nodejs.org/"
    echo ""
    exit 1
fi

NPM_VERSION=$(npm -v)
print_success "npm $NPM_VERSION detectado"

# 4. Instalar dependências com NPM
echo ""
echo "📦 Instalando dependências do projeto com NPM..."
echo "   (Isso pode levar alguns minutos...)"
echo ""

# Usar npm install com flags que evitam problemas
if npm install --legacy-peer-deps --no-audit --no-fund; then
    print_success "Dependências instaladas com sucesso"
else
    print_error "Falha ao instalar dependências!"
    echo ""
    echo "Tente rodar manualmente:"
    echo "  npm install --legacy-peer-deps"
    echo ""
    exit 1
fi

# 5. Verificar se better-sqlite3 foi compilado
echo ""
print_info "Verificando compilação do better-sqlite3..."

if [ -f "node_modules/better-sqlite3/build/Release/better_sqlite3.node" ] || \
   [ -f "node_modules/better-sqlite3/lib/binding/node-v*/better_sqlite3.node" ]; then
    print_success "better-sqlite3 compilado com sucesso"
else
    print_warning "Bindings do better-sqlite3 não encontrados"
    print_info "Tentando recompilar..."
    
    cd node_modules/better-sqlite3
    if npm run install 2>/dev/null; then
        cd ../..
        print_success "better-sqlite3 recompilado"
    else
        cd ../..
        print_error "Falha ao compilar better-sqlite3"
        echo ""
        echo "Instale ferramentas de compilação:"
        echo "  macOS: xcode-select --install"
        echo "  Linux: sudo apt install build-essential python3"
        echo ""
        exit 1
    fi
fi

# 6. Verificar drizzle-kit
echo ""
echo "🔍 Verificando ferramentas de banco de dados..."

if [ -f "node_modules/.bin/drizzle-kit" ]; then
    print_success "drizzle-kit disponível"
else
    print_error "drizzle-kit não encontrado!"
    exit 1
fi

# 7. Configurar .env
echo ""
echo "⚙️  Configurando ambiente..."

if [ -f .env ]; then
    print_warning "Arquivo .env já existe"
    read -p "Deseja sobrescrever? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        print_info "Mantendo .env existente"
    else
        cat > .env << 'EOF'
DATABASE_URL=local.db
JWT_SECRET=local-dev-secret-$(openssl rand -hex 16)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_TITLE=App Cultivo
VITE_APP_ID=local-dev
OWNER_OPEN_ID=local-user
OWNER_NAME=Usuário Local
NODE_ENV=development
EOF
        print_success "Arquivo .env criado"
    fi
else
    cat > .env << 'EOF'
DATABASE_URL=local.db
JWT_SECRET=local-dev-secret-$(openssl rand -hex 16)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_TITLE=App Cultivo
VITE_APP_ID=local-dev
OWNER_OPEN_ID=local-user
OWNER_NAME=Usuário Local
NODE_ENV=development
EOF
    print_success "Arquivo .env criado"
fi

# 8. Criar banco de dados SQLite
echo ""
echo "🗄️  Configurando banco de dados SQLite..."

if [ -f local.db ]; then
    print_warning "Banco de dados local.db já existe"
    read -p "Deseja recriar? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        rm -f local.db
        print_info "Banco removido, criando novo..."
    else
        print_info "Mantendo banco existente"
        echo ""
        print_success "🎉 Instalação concluída!"
        echo ""
        echo "Para iniciar o servidor:"
        echo "  ${BLUE}npm run dev${NC}"
        echo ""
        exit 0
    fi
fi

echo ""
echo "📊 Criando banco de dados SQLite..."

if [ -f "init-db.mjs" ]; then
    print_info "Inicializando banco de dados..."
    if node init-db.mjs; then
        print_success "Banco de dados criado com dados de exemplo"
    else
        print_error "Falha ao criar banco de dados"
        exit 1
    fi
elif [ -f "schema-sqlite.sql" ] && [ -f "data-export.sql" ]; then
    print_info "Criando banco a partir de arquivos SQL..."
    node -e "
    const Database = require('better-sqlite3');
    const fs = require('fs');
    const db = new Database('local.db');
    
    // Importar schema
    const schema = fs.readFileSync('schema-sqlite.sql', 'utf8');
    db.exec(schema);
    
    // Importar dados
    const data = fs.readFileSync('data-export.sql', 'utf8');
    db.exec(data);
    
    db.close();
    console.log('✅ Banco criado com sucesso');
    "
    if [ $? -eq 0 ]; then
        print_success "Banco de dados criado"
    else
        print_error "Falha ao criar banco"
        exit 1
    fi
else
    print_error "Arquivos de inicialização do banco não encontrados"
    echo ""
    echo "Arquivos necessários:"
    echo "  - init-db.mjs OU"
    echo "  - schema-sqlite.sql + data-export.sql"
    echo ""
    exit 1
fi

# 9. Finalização
echo ""
print_success "🎉 Instalação concluída com sucesso!"
echo ""
echo "Para iniciar o servidor de desenvolvimento:"
echo "  ${GREEN}npm run dev${NC}"
echo ""
echo "O servidor estará disponível em:"
echo "  ${BLUE}http://localhost:3000${NC}"
echo ""
