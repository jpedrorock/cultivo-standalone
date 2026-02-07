#!/bin/bash

# ============================================
# App Cultivo - Instalador MySQL
# ============================================
# Instala e configura o App Cultivo com MySQL local
# Compatível 100% com o ambiente Manus

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de print
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

print_header() {
    echo ""
    echo -e "${BLUE}╭────────────────────────────────────────────────────────────────────────────────────────────╮${NC}"
    echo -e "${BLUE}│${NC}  ${GREEN}$1${NC}"
    echo -e "${BLUE}╰────────────────────────────────────────────────────────────────────────────────────────────╯${NC}"
    echo ""
}

# Detectar sistema operacional
OS="$(uname -s)"
case "${OS}" in
    Linux*)     PLATFORM=Linux;;
    Darwin*)    PLATFORM=Mac;;
    CYGWIN*|MINGW*|MSYS*) PLATFORM=Windows;;
    *)          PLATFORM="UNKNOWN:${OS}"
esac

print_header "🌱 App Cultivo - Instalador MySQL v2.0"
echo "Sistema detectado: $PLATFORM"
echo ""

# 1. Verificar Node.js
echo "🔍 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado!"
    echo ""
    echo "Instale Node.js 18+ primeiro:"
    echo "  macOS:   brew install node"
    echo "  Ubuntu:  sudo apt-get install nodejs npm"
    echo "  Windows: https://nodejs.org/"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js encontrado: $NODE_VERSION"

# 2. Verificar/Instalar pnpm
echo ""
echo "🔍 Verificando pnpm..."
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm não encontrado, instalando..."
    npm install -g pnpm
    print_success "pnpm instalado"
else
    PNPM_VERSION=$(pnpm -v)
    print_success "pnpm encontrado: v$PNPM_VERSION"
fi

# 3. Verificar MySQL
echo ""
echo "🔍 Verificando MySQL..."
if ! command -v mysql &> /dev/null; then
    print_error "MySQL não encontrado!"
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  INSTALE O MYSQL PRIMEIRO"
    echo "═══════════════════════════════════════════════════════════════"
    echo ""
    if [ "$PLATFORM" = "Mac" ]; then
        echo "No macOS, instale com Homebrew:"
        echo ""
        echo "  1. Instalar MySQL:"
        echo "     brew install mysql"
        echo ""
        echo "  2. Iniciar serviço:"
        echo "     brew services start mysql"
        echo ""
        echo "  3. Configurar senha root (opcional):"
        echo "     mysql_secure_installation"
        echo ""
    elif [ "$PLATFORM" = "Linux" ]; then
        echo "No Linux (Ubuntu/Debian):"
        echo ""
        echo "  sudo apt-get update"
        echo "  sudo apt-get install mysql-server"
        echo "  sudo systemctl start mysql"
        echo "  sudo mysql_secure_installation"
        echo ""
    else
        echo "Visite: https://dev.mysql.com/downloads/mysql/"
        echo ""
    fi
    echo "Após instalar o MySQL, rode este instalador novamente."
    echo ""
    exit 1
fi

print_success "MySQL encontrado"

# 4. Testar conexão MySQL
echo ""
echo "🔌 Testando conexão MySQL..."
if mysql -u root -e "SELECT 1" &> /dev/null; then
    print_success "Conexão MySQL OK (sem senha)"
    MYSQL_PASSWORD=""
else
    print_warning "MySQL requer senha"
    echo ""
    read -sp "Digite a senha do MySQL root: " MYSQL_PASSWORD
    echo ""
    
    if ! mysql -u root -p"$MYSQL_PASSWORD" -e "SELECT 1" &> /dev/null; then
        print_error "Senha incorreta ou MySQL não acessível"
        exit 1
    fi
    print_success "Conexão MySQL OK"
fi

# 5. Criar database
echo ""
echo "🗄️  Criando database..."
DB_NAME="cultivo_local"

if [ -z "$MYSQL_PASSWORD" ]; then
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
else
    mysql -u root -p"$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
fi

print_success "Database '$DB_NAME' criado"

# 6. Importar dados
echo ""
echo "📊 Importando dados iniciais..."
if [ ! -f banco-inicial.sql ]; then
    print_error "banco-inicial.sql não encontrado!"
    exit 1
fi

if [ -z "$MYSQL_PASSWORD" ]; then
    mysql -u root $DB_NAME < banco-inicial.sql
else
    mysql -u root -p"$MYSQL_PASSWORD" $DB_NAME < banco-inicial.sql
fi

print_success "Dados importados com sucesso!"
print_info "   • 3 estufas (A, B, C)"
print_info "   • 6 strains cadastradas"
print_info "   • 6 ciclos (ativos e finalizados)"
print_info "   • Registros diários e tarefas"

# 7. Configurar .env
echo ""
echo "⚙️  Configurando ambiente..."

if [ -z "$MYSQL_PASSWORD" ]; then
    DATABASE_URL="mysql://root@localhost:3306/$DB_NAME"
else
    DATABASE_URL="mysql://root:$MYSQL_PASSWORD@localhost:3306/$DB_NAME"
fi

cat > .env << EOF
# Database
DATABASE_URL="$DATABASE_URL"

# App
NODE_ENV=development
PORT=3000
EOF

print_success "Arquivo .env criado"

# 8. Instalar dependências
echo ""
echo "📦 Instalando dependências..."
echo "   (Isso pode levar alguns minutos...)"
echo ""

if pnpm install; then
    print_success "Dependências instaladas"
else
    print_error "Erro ao instalar dependências"
    exit 1
fi

# 9. Verificar banco
echo ""
echo "🔍 Verificando banco de dados..."
TENT_COUNT=$(mysql -u root $([ -n "$MYSQL_PASSWORD" ] && echo "-p$MYSQL_PASSWORD") -D $DB_NAME -se "SELECT COUNT(*) FROM tents;")
print_success "Banco verificado: $TENT_COUNT estufas encontradas"

# 10. Finalizar
print_header "🎉 Instalação concluída com sucesso!"

echo "Para iniciar o servidor de desenvolvimento:"
echo ""
echo "  ${GREEN}pnpm dev${NC}"
echo ""
echo "O app estará disponível em: ${BLUE}http://localhost:3000${NC}"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  COMANDOS ÚTEIS"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  pnpm dev          - Iniciar servidor de desenvolvimento"
echo "  pnpm build        - Build para produção"
echo "  pnpm test         - Rodar testes"
echo ""
echo "  Backup manual:"
echo "  mysqldump -u root $([ -n "$MYSQL_PASSWORD" ] && echo "-p") $DB_NAME > backup.sql"
echo ""
echo "  Restaurar backup:"
echo "  mysql -u root $([ -n "$MYSQL_PASSWORD" ] && echo "-p") $DB_NAME < backup.sql"
echo ""
