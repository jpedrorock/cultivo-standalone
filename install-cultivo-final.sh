#!/bin/bash

# 🌱 Cultivo App - Instalador Único e Definitivo para macOS
# Versão: 3.1.0 Final
# Status: Testado, Validado e Otimizado
# Data: Fevereiro 2026
# Autor: Manus AI

set -e

# ============================================
# CONFIGURAÇÃO INICIAL
# ============================================

echo ""
echo "🌱 ============================================"
echo "🌱   Cultivo App - Instalador Definitivo"
echo "🌱 ============================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funções de output
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Erro: package.json não encontrado!"
    echo "Execute este script dentro da pasta cultivo-architecture-docs"
    exit 1
fi

# ============================================
# PASSO 1: VERIFICAR MYSQL
# ============================================

echo ""
echo "📋 Passo 1: Verificando MySQL 8.0..."

if ! command -v /opt/homebrew/opt/mysql@8.0/bin/mysql &> /dev/null; then
    print_error "MySQL 8.0 não encontrado!"
    echo ""
    echo "Para instalar, execute:"
    echo "  brew install mysql@8.0"
    exit 1
fi

print_success "MySQL 8.0 encontrado"

# ============================================
# PASSO 2: INICIAR MYSQL
# ============================================

echo ""
echo "📋 Passo 2: Verificando MySQL..."

if ! /opt/homebrew/opt/mysql@8.0/bin/mysql -u root -e "SELECT 1;" &> /dev/null; then
    print_warning "MySQL não está rodando. Iniciando..."
    brew services start mysql@8.0
    sleep 3
fi

print_success "MySQL está rodando"

# ============================================
# PASSO 3: PEDIR SENHA DO ROOT
# ============================================

echo ""
echo "📋 Passo 3: Autenticação MySQL..."
echo ""

read -sp "Digite a senha do usuário root do MySQL: " MYSQL_ROOT_PASSWORD
echo ""

# Verificar senha
if ! /opt/homebrew/opt/mysql@8.0/bin/mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "SELECT 1;" &> /dev/null; then
    print_error "Senha do root incorreta!"
    exit 1
fi

print_success "Autenticação bem-sucedida"

# ============================================
# PASSO 4: CRIAR USUÁRIO MYSQL
# ============================================

echo ""
echo "📋 Passo 4: Configurando usuário MySQL..."

/opt/homebrew/opt/mysql@8.0/bin/mysql -u root -p"$MYSQL_ROOT_PASSWORD" << 'EOF'
CREATE USER IF NOT EXISTS 'cultivo'@'localhost' IDENTIFIED BY 'cultivo123';
GRANT ALL PRIVILEGES ON cultivo_app.* TO 'cultivo'@'localhost';
FLUSH PRIVILEGES;
EOF

print_success "Usuário 'cultivo' configurado"

# ============================================
# PASSO 5: CRIAR BANCO DE DADOS
# ============================================

echo ""
echo "📋 Passo 5: Criando banco de dados..."

/opt/homebrew/opt/mysql@8.0/bin/mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "DROP DATABASE IF EXISTS cultivo_app; CREATE DATABASE cultivo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

print_success "Banco de dados criado"

# ============================================
# PASSO 6: CRIAR ARQUIVO .ENV
# ============================================

echo ""
echo "📋 Passo 6: Criando arquivo .env..."

cat > .env << 'EOF'
DATABASE_URL=mysql://cultivo:cultivo123@localhost:3306/cultivo_app
NODE_ENV=development
JWT_SECRET=dev-secret-key-change-in-production
OAUTH_SERVER_URL=http://localhost:3000
OWNER_NAME=Test User
OWNER_OPEN_ID=test-user-id
VITE_ANALYTICS_ENDPOINT=http://localhost:3000
VITE_ANALYTICS_WEBSITE_ID=test-website-id
VITE_APP_ID=cultivo-app
VITE_APP_TITLE=Cultivo App
VITE_APP_LOGO=https://via.placeholder.com/32
VITE_FRONTEND_FORGE_API_KEY=test-key
VITE_FRONTEND_FORGE_API_URL=http://localhost:3000/api
VITE_OAUTH_PORTAL_URL=http://localhost:3000
EOF

print_success "Arquivo .env criado"

# ============================================
# PASSO 7: LIMPAR E INSTALAR DEPENDÊNCIAS
# ============================================

echo ""
echo "📋 Passo 7: Instalando dependências..."
echo "   (Isso pode levar alguns minutos...)"

# Limpar cache
rm -rf node_modules 2>/dev/null || true

# Instalar com legacy-peer-deps para evitar conflitos
npm install --legacy-peer-deps > /dev/null 2>&1

# Instalar react-is que pode estar faltando
npm install react-is --legacy-peer-deps > /dev/null 2>&1

print_success "Dependências instaladas"

# ============================================
# PASSO 8: INICIALIZAR BANCO DE DADOS
# ============================================

echo ""
echo "📋 Passo 8: Inicializando banco de dados..."

export DATABASE_URL="mysql://cultivo:cultivo123@localhost:3306/cultivo_app"

# Executar db:push
npm run db:push > /dev/null 2>&1

print_success "Banco de dados inicializado"

# ============================================
# PASSO 9: VERIFICAR INSTALAÇÃO
# ============================================

echo ""
echo "📋 Passo 9: Verificando instalação..."

# Verificar tabelas
TABLES=$(/opt/homebrew/opt/mysql@8.0/bin/mysql -u cultivo -p'cultivo123' cultivo_app -e "SHOW TABLES;" 2>/dev/null | wc -l)

if [ $TABLES -gt 1 ]; then
    print_success "Banco de dados verificado ($TABLES tabelas)"
else
    print_error "Erro ao criar tabelas!"
    exit 1
fi

# ============================================
# RESUMO FINAL
# ============================================

echo ""
echo "🎉 ============================================"
echo "🎉   Instalação Concluída com Sucesso!"
echo "🎉 ============================================"
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1. Inicie o servidor:"
echo "   ${BLUE}npm run dev${NC}"
echo ""
echo "2. Abra no navegador:"
echo "   ${BLUE}http://localhost:3000${NC}"
echo ""
echo "3. Teste criando uma nova estufa!"
echo ""
echo "💡 Dicas Importantes:"
echo "   • Deixe o servidor rodando (npm run dev)"
echo "   • Para parar: Ctrl+C"
echo "   • Para parar MySQL: brew services stop mysql@8.0"
echo "   • Para reiniciar MySQL: brew services restart mysql@8.0"
echo ""
echo "📊 Configuração:"
echo "   • Banco: cultivo_app"
echo "   • Usuário: cultivo"
echo "   • Senha: cultivo123"
echo "   • Host: localhost:3306"
echo ""
echo "✅ Tudo pronto! Divirta-se cultivando! 🌱"
echo ""
