#!/bin/bash

# App Cultivo - Instalador MySQL para macOS
# Este script instala e configura MySQL + Node.js para desenvolvimento local

set -e  # Exit on error

echo "🌱 ============================================"
echo "🌱   App Cultivo - Instalador MySQL (macOS)"
echo "🌱 ============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo -e "${RED}❌ Este script é apenas para macOS!${NC}"
  echo "   Para Linux, use: bash install.sh"
  exit 1
fi

echo "ℹ️  Plataforma: $(uname -s) $(uname -m)"
echo ""

# ============================================
# 1. Check Homebrew
# ============================================
echo "📋 Verificando Homebrew..."
if ! command -v brew &> /dev/null; then
  echo -e "${YELLOW}⚠️  Homebrew não encontrado!${NC}"
  echo ""
  echo "Instalando Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  
  # Add Homebrew to PATH for Apple Silicon
  if [[ $(uname -m) == "arm64" ]]; then
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
  fi
else
  echo -e "${GREEN}✅ Homebrew instalado${NC}"
fi
echo ""

# ============================================
# 2. Check Node.js
# ============================================
echo "📋 Verificando Node.js..."
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}⚠️  Node.js não encontrado!${NC}"
  echo "Instalando Node.js via Homebrew..."
  brew install node
else
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}✅ Node.js $NODE_VERSION detectado${NC}"
fi
echo ""

# ============================================
# 3. Install MySQL
# ============================================
echo "📋 Verificando MySQL..."
if ! command -v mysql &> /dev/null; then
  echo -e "${YELLOW}⚠️  MySQL não encontrado!${NC}"
  echo "Instalando MySQL via Homebrew..."
  brew install mysql
  
  echo "Iniciando serviço MySQL..."
  brew services start mysql
  
  echo -e "${GREEN}✅ MySQL instalado e iniciado${NC}"
  echo ""
  echo -e "${YELLOW}⚠️  IMPORTANTE: Configure uma senha para o MySQL:${NC}"
  echo "   Rode: mysql_secure_installation"
  echo ""
else
  echo -e "${GREEN}✅ MySQL já instalado${NC}"
  
  # Check if MySQL is running
  if brew services list | grep mysql | grep started > /dev/null; then
    echo -e "${GREEN}✅ MySQL está rodando${NC}"
  else
    echo "Iniciando MySQL..."
    brew services start mysql
  fi
fi
echo ""

# ============================================
# 4. Create Database
# ============================================
echo "📊 Configurando banco de dados..."

DB_NAME="cultivo_app"
DB_USER="root"
DB_PASS=""

# Try to create database
echo "Criando banco de dados '$DB_NAME'..."
if mysql -u"$DB_USER" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null; then
  echo -e "${GREEN}✅ Banco de dados criado${NC}"
else
  echo -e "${YELLOW}⚠️  Não foi possível criar o banco automaticamente${NC}"
  echo ""
  echo "Por favor, crie manualmente:"
  echo "  mysql -u root -p"
  echo "  CREATE DATABASE cultivo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  echo ""
  read -p "Pressione ENTER após criar o banco de dados..."
fi
echo ""

# ============================================
# 5. Configure .env
# ============================================
echo "⚙️  Configurando variáveis de ambiente..."

# Ask for MySQL password if needed
echo ""
echo "Digite a senha do MySQL (deixe em branco se não tiver senha):"
read -s MYSQL_PASSWORD

if [ -z "$MYSQL_PASSWORD" ]; then
  DATABASE_URL="mysql://root@localhost:3306/$DB_NAME"
else
  DATABASE_URL="mysql://root:$MYSQL_PASSWORD@localhost:3306/$DB_NAME"
fi

# Create .env file
cat > .env << EOF
# Database
DATABASE_URL=$DATABASE_URL

# Server
NODE_ENV=development
PORT=3000

# Optional: Analytics (deixe vazio para desenvolvimento local)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=

# Optional: OAuth (deixe vazio para desenvolvimento local)
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
EOF

echo -e "${GREEN}✅ Arquivo .env criado${NC}"
echo ""

# ============================================
# 6. Install Dependencies
# ============================================
echo "📦 Instalando dependências do projeto..."
echo "   (Isso pode levar alguns minutos...)"
echo ""

npm install --legacy-peer-deps

echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# ============================================
# 7. Initialize Database
# ============================================
echo "🗄️  Inicializando banco de dados..."
echo ""

if [ -f "init-mysql.mjs" ]; then
  node init-mysql.mjs
else
  echo -e "${YELLOW}⚠️  Script init-mysql.mjs não encontrado${NC}"
  echo "   Criando tabelas manualmente via Drizzle..."
  npm run db:push
fi

echo ""

# ============================================
# 8. Test Connection
# ============================================
echo "🔍 Testando conexão com banco de dados..."

if mysql -u"$DB_USER" ${MYSQL_PASSWORD:+-p"$MYSQL_PASSWORD"} -e "USE $DB_NAME; SHOW TABLES;" > /dev/null 2>&1; then
  TABLE_COUNT=$(mysql -u"$DB_USER" ${MYSQL_PASSWORD:+-p"$MYSQL_PASSWORD"} -e "USE $DB_NAME; SHOW TABLES;" | wc -l)
  TABLE_COUNT=$((TABLE_COUNT - 1))  # Remove header line
  echo -e "${GREEN}✅ Banco de dados OK${NC}"
  echo "ℹ️  Tabelas criadas: $TABLE_COUNT"
else
  echo -e "${RED}❌ Erro ao conectar ao banco de dados${NC}"
  echo "   Verifique as credenciais no arquivo .env"
fi
echo ""

# ============================================
# Done!
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ Instalação concluída com sucesso!${NC}"
echo ""
echo "📋 Resumo:"
echo "  • Node.js: $(node -v)"
echo "  • MySQL: $(mysql --version | awk '{print $5}' | sed 's/,//')"
echo "  • Banco: $DB_NAME"
echo "  • Porta: 3000"
echo ""
echo "🚀 Para iniciar o servidor de desenvolvimento:"
echo ""
echo "     npm run dev"
echo ""
echo "🌐 O app estará disponível em:"
echo ""
echo "     http://localhost:3000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
