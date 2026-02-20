#!/bin/bash

# ============================================
# App Cultivo - Script de Instalação Automática
# ============================================

set -e  # Parar em caso de erro

echo "======================================"
echo "  App Cultivo - Instalação Automática"
echo "======================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para printar mensagens coloridas
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${NC}ℹ${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then
    print_warning "Não execute este script como root!"
    exit 1
fi

# 1. Verificar Node.js
echo ""
print_info "Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 22 ]; then
        print_success "Node.js $(node -v) instalado"
    else
        print_error "Node.js versão 22+ necessário. Versão atual: $(node -v)"
        exit 1
    fi
else
    print_error "Node.js não encontrado. Instale Node.js 22+ primeiro."
    exit 1
fi

# 2. Verificar pnpm
echo ""
print_info "Verificando pnpm..."
if command -v pnpm &> /dev/null; then
    print_success "pnpm $(pnpm -v) instalado"
else
    print_warning "pnpm não encontrado. Instalando..."
    npm install -g pnpm
    print_success "pnpm instalado"
fi

# 3. Verificar MySQL
echo ""
print_info "Verificando MySQL..."
if command -v mysql &> /dev/null; then
    print_success "MySQL instalado"
else
    print_error "MySQL não encontrado. Instale MySQL 8.0+ primeiro."
    exit 1
fi

# 4. Verificar arquivo .env
echo ""
print_info "Verificando configuração..."
if [ ! -f ".env" ]; then
    print_warning "Arquivo .env não encontrado"
    
    # Perguntar se deseja criar .env interativamente
    read -p "Deseja criar arquivo .env agora? (s/n): " CREATE_ENV
    
    if [ "$CREATE_ENV" = "s" ] || [ "$CREATE_ENV" = "S" ]; then
        echo ""
        print_info "Criando arquivo .env..."
        
        # Solicitar informações do banco de dados
        read -p "Host do MySQL [localhost]: " DB_HOST
        DB_HOST=${DB_HOST:-localhost}
        
        read -p "Porta do MySQL [3306]: " DB_PORT
        DB_PORT=${DB_PORT:-3306}
        
        read -p "Nome do banco de dados [cultivo_app]: " DB_NAME
        DB_NAME=${DB_NAME:-cultivo_app}
        
        read -p "Usuário do MySQL: " DB_USER
        read -sp "Senha do MySQL: " DB_PASS
        echo ""
        
        # Gerar JWT_SECRET
        JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        
        # Criar arquivo .env
        cat > .env << EOF
# Banco de Dados
DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Segurança
JWT_SECRET="${JWT_SECRET}"

# Proprietário
OWNER_OPEN_ID="admin"
OWNER_NAME="Administrador"

# Aplicação
VITE_APP_TITLE="App Cultivo"
VITE_APP_LOGO="/logo.png"
EOF
        
        print_success "Arquivo .env criado"
    else
        print_error "Arquivo .env é necessário. Copie .env.example e configure manualmente."
        exit 1
    fi
else
    print_success "Arquivo .env encontrado"
fi

# 5. Instalar dependências
echo ""
print_info "Instalando dependências..."
pnpm install
print_success "Dependências instaladas"

# 6. Criar banco de dados (se não existir)
echo ""
print_info "Verificando banco de dados..."

# Extrair credenciais do .env
DB_URL=$(grep DATABASE_URL .env | cut -d'=' -f2 | tr -d '"')
DB_USER=$(echo $DB_URL | sed 's/mysql:\/\/\([^:]*\):.*/\1/')
DB_PASS=$(echo $DB_URL | sed 's/mysql:\/\/[^:]*:\([^@]*\)@.*/\1/')
DB_HOST=$(echo $DB_URL | sed 's/.*@\([^:]*\):.*/\1/')
DB_PORT=$(echo $DB_URL | sed 's/.*:\([0-9]*\)\/.*/\1/')
DB_NAME=$(echo $DB_URL | sed 's/.*\/\([^?]*\).*/\1/')

# Verificar se banco existe
if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "USE $DB_NAME" 2>/dev/null; then
    print_success "Banco de dados '$DB_NAME' existe"
else
    print_warning "Banco de dados '$DB_NAME' não existe"
    read -p "Deseja criar o banco de dados? (s/n): " CREATE_DB
    
    if [ "$CREATE_DB" = "s" ] || [ "$CREATE_DB" = "S" ]; then
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        print_success "Banco de dados '$DB_NAME' criado"
    else
        print_error "Banco de dados é necessário. Crie manualmente e execute o script novamente."
        exit 1
    fi
fi

# 7. Executar migrations
echo ""
print_info "Aplicando migrations..."
pnpm db:push
print_success "Migrations aplicadas"

# 8. Build da aplicação
echo ""
print_info "Compilando aplicação..."
pnpm build
print_success "Build concluído"

# 9. Perguntar se deseja iniciar o servidor
echo ""
echo "======================================"
print_success "Instalação concluída com sucesso!"
echo "======================================"
echo ""

read -p "Deseja iniciar o servidor agora? (s/n): " START_SERVER

if [ "$START_SERVER" = "s" ] || [ "$START_SERVER" = "S" ]; then
    echo ""
    print_info "Iniciando servidor..."
    echo ""
    print_warning "Pressione Ctrl+C para parar o servidor"
    echo ""
    NODE_ENV=production node dist/_core/index.js
else
    echo ""
    print_info "Para iniciar o servidor manualmente, execute:"
    echo ""
    echo "  NODE_ENV=production node dist/_core/index.js"
    echo ""
    print_info "Ou use PM2 para gerenciamento em produção:"
    echo ""
    echo "  npm install -g pm2"
    echo "  pm2 start dist/_core/index.js --name app-cultivo"
    echo "  pm2 save"
    echo "  pm2 startup"
    echo ""
fi
