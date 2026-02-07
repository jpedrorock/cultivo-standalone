#!/bin/bash

# ============================================
# App Cultivo - Script de Setup Local
# ============================================

echo "🌱 Iniciando setup do App Cultivo..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ primeiro:"
    echo "   https://nodejs.org/"
    exit 1
fi

# Verificar se pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm não encontrado. Instalando..."
    npm install -g pnpm
fi

# Instalar dependências
echo "📦 Instalando dependências..."
if ! pnpm install; then
    echo "❌ Erro ao instalar dependências!"
    echo "Verifique se o pnpm está instalado: npm install -g pnpm"
    exit 1
fi

echo "✅ Dependências instaladas com sucesso"

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "⚙️  Criando arquivo .env..."
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

# Storage local (sem S3)
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""

# IA desabilitada (sem LLM)
# BUILT_IN_FORGE_API_URL=""
# BUILT_IN_FORGE_API_KEY=""
EOF
    echo "✅ Arquivo .env criado"
else
    echo "ℹ️  Arquivo .env já existe, pulando..."
fi

# Criar banco de dados SQLite
if [ ! -f local.db ]; then
    echo "🗄️  Criando banco de dados SQLite..."
    touch local.db
    echo "✅ Banco de dados criado: local.db"
else
    echo "ℹ️  Banco de dados já existe, pulando..."
fi

# Rodar migrações
echo "🔄 Aplicando migrações do banco de dados..."
if ! pnpm db:push; then
    echo "⚠️  Erro ao aplicar migrações, mas continuando..."
    echo "Você pode rodar 'pnpm db:push' manualmente depois."
fi

echo ""
echo "✅ Setup concluído com sucesso!"
echo ""
echo "Para iniciar o servidor de desenvolvimento:"
echo "  pnpm dev"
echo ""
echo "O app estará disponível em: http://localhost:3000"
echo ""
