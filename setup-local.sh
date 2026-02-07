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

# Criar banco de dados SQLite e aplicar migrações
echo "🗄️  Configurando banco de dados SQLite..."

# Remover banco antigo se existir (para garantir estado limpo)
if [ -f local.db ]; then
    echo "ℹ️  Removendo banco de dados antigo..."
    rm -f local.db
fi

# Criar banco vazio
touch local.db
echo "✅ Arquivo local.db criado"

# Aplicar migrações (CRÍTICO - deve funcionar)
echo "🔄 Aplicando migrações do banco de dados..."
if ! pnpm db:push; then
    echo ""
    echo "❌ ERRO CRÍTICO: Falha ao aplicar migrações!"
    echo ""
    echo "Possíveis causas:"
    echo "  1. drizzle-kit não instalado (rode: pnpm install)"
    echo "  2. Erro no schema do banco (verifique drizzle/schema.ts)"
    echo "  3. Permissões de arquivo (verifique se pode escrever em local.db)"
    echo ""
    echo "Tente rodar manualmente:"
    echo "  pnpm db:push"
    echo ""
    exit 1
fi

echo "✅ Migrações aplicadas com sucesso"

# Importar dados iniciais se banco-inicial.sql existir
if [ -f banco-inicial.sql ]; then
    echo "📊 Importando dados iniciais..."
    if command -v sqlite3 &> /dev/null; then
        sqlite3 local.db < banco-inicial.sql
        echo "✅ Dados iniciais importados"
    else
        echo "⚠️  sqlite3 não encontrado, pulando importação de dados"
        echo "   Você pode importar manualmente depois pela interface"
    fi
fi

echo ""
echo "✅ Setup concluído com sucesso!"
echo ""
echo "Para iniciar o servidor de desenvolvimento:"
echo "  pnpm dev"
echo ""
echo "O app estará disponível em: http://localhost:3000"
echo ""
