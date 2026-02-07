#!/bin/bash

# 🌱 App Cultivo - Instalador Automático para Mac
# Este script instala todas as dependências e configura o aplicativo

echo "🌱 ============================================"
echo "   App Cultivo - Instalador para Mac"
echo "============================================"
echo ""

# Verificar se está no Mac
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ Este instalador é apenas para Mac (macOS)"
    exit 1
fi

echo "📋 Verificando requisitos do sistema..."
echo ""

# Verificar se Homebrew está instalado
if ! command -v brew &> /dev/null; then
    echo "📦 Homebrew não encontrado. Instalando..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew já instalado"
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "📦 Node.js não encontrado. Instalando Node.js 22..."
    brew install node@22
    brew link node@22
else
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "⚠️  Node.js versão $NODE_VERSION encontrada. Atualizando para versão 22..."
        brew install node@22
        brew link --overwrite node@22
    else
        echo "✅ Node.js $(node -v) já instalado"
    fi
fi

echo ""
echo "📦 Instalando dependências do projeto..."
echo "   (Isso pode levar alguns minutos...)"
echo ""

# Usar npm (mais estável no Mac)
echo "⚙️  Instalando pacotes com npm..."
npm install --legacy-peer-deps

echo ""
echo "⚙️  Configurando banco de dados..."
echo ""

# Verificar se arquivo .env existe
if [ ! -f ".env" ]; then
    echo "📝 Criando arquivo de configuração (.env)..."
    cat > .env << 'EOF'
# Banco de Dados Local (SQLite)
DATABASE_URL=file:./local.db

# Autenticação (gerado automaticamente)
JWT_SECRET=local-dev-secret-change-in-production
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im

# Aplicação
VITE_APP_TITLE=App Cultivo
VITE_APP_LOGO=/logo.png
VITE_APP_ID=local-dev

# Outros
OWNER_OPEN_ID=local-user
OWNER_NAME=Usuário Local
EOF
    echo "✅ Arquivo .env criado"
else
    echo "✅ Arquivo .env já existe"
fi

# Executar migrações do banco de dados
echo ""
echo "🗄️  Criando tabelas do banco de dados..."
npm run db:push

echo ""
echo "✅ ============================================"
echo "   Instalação concluída com sucesso!"
echo "============================================"
echo ""
echo "🚀 Para iniciar o aplicativo, execute:"
echo ""
echo "   npm run dev"
echo ""
echo "📱 Depois acesse no navegador:"
echo ""
echo "   http://localhost:3000"
echo ""
echo "💡 Dicas:"
echo "   - Pressione Ctrl+C para parar o servidor"
echo "   - O banco de dados fica em: ./local.db"
echo "   - Faça backup regularmente pela interface"
echo ""
echo "📚 Documentação completa em: GUIA_INSTALACAO_SIMPLES.pdf"
echo ""
