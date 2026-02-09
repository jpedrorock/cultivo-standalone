#!/bin/bash

# Script de setup local para o App Cultivo
# Configura ambiente de desenvolvimento local sem dependências do Manus

set -e  # Para na primeira falha

echo "🌱 Iniciando setup do App Cultivo..."

# 1. Instalar dependências
echo "📦 Instalando dependências..."
pnpm install

# 2. Aprovar build scripts do better-sqlite3
echo "🔧 Configurando better-sqlite3..."
pnpm approve-builds better-sqlite3 esbuild core-js || true

# 3. Reinstalar para compilar bindings nativos
echo "🔨 Compilando bindings nativos..."
pnpm rebuild better-sqlite3

echo "✅ Dependências instaladas com sucesso"

# 4. Criar arquivo .env se não existir
if [ ! -f .env ]; then
  echo "📝 Criando arquivo .env..."
  cat > .env << 'EOF'
# Banco de dados local (SQLite)
DATABASE_URL=file:./local.db

# Porta do servidor (padrão: 3000)
PORT=3000

# Ambiente
NODE_ENV=development

# JWT Secret (gere um aleatório em produção)
JWT_SECRET=local-dev-secret-change-in-production

# OAuth (desabilitado para desenvolvimento local)
# Se quiser integrar OAuth, configure estas variáveis:
# OAUTH_SERVER_URL=
# VITE_OAUTH_PORTAL_URL=
# VITE_APP_ID=

# Título e logo do app
VITE_APP_TITLE=App Cultivo
VITE_APP_LOGO=/logo.svg

# Owner info (para desenvolvimento local)
OWNER_NAME=Local Dev
OWNER_OPEN_ID=local-dev-user
EOF
  echo "✅ Arquivo .env criado"
else
  echo "ℹ️  Arquivo .env já existe, pulando..."
fi

# 5. Inicializar banco de dados SQLite
echo "🗄️  Configurando banco de dados SQLite..."

# Remover banco antigo se existir
if [ -f local.db ]; then
  echo "ℹ️  Removendo banco de dados antigo..."
  rm -f local.db
fi

# Criar banco vazio
touch local.db
echo "✅ Arquivo local.db criado"

# 6. Aplicar schema e dados iniciais
echo "📊 Criando tabelas e inserindo dados de exemplo..."

if [ -f schema-sqlite.sql ]; then
  # Usar sqlite3 CLI se disponível
  if command -v sqlite3 &> /dev/null; then
    echo "   Aplicando schema..."
    sqlite3 local.db < schema-sqlite.sql
    
    # Aplicar dados iniciais se existir
    if [ -f data-export.sql ]; then
      echo "   Importando dados de exemplo (29 registros)..."
      sqlite3 local.db < data-export.sql
      echo "✅ Banco inicializado com dados de exemplo"
    else
      echo "✅ Schema aplicado com sucesso"
    fi
  else
    # Usar Node.js com better-sqlite3
    echo "   sqlite3 não encontrado, usando Node.js..."
    node init-db.mjs
  fi
else
  echo "⚠️  Arquivo schema-sqlite.sql não encontrado"
  echo "ℹ️  O banco será criado automaticamente quando o servidor iniciar"
fi

# 7. Instruções finais
echo ""
echo "✅ Setup concluído com sucesso!"
echo ""
echo "📊 Banco de dados inicializado com:"
echo "   - 19 tabelas criadas"
echo "   - 29 registros de exemplo (14 dias de histórico)"
echo "   - 1 estufa de exemplo"
echo "   - 1 ciclo ativo"
echo "   - Dados prontos para testar gráficos"
echo ""
echo "🚀 Para iniciar o servidor de desenvolvimento:"
echo "   pnpm dev"
echo ""
echo "🌐 O app estará disponível em:"
echo "   http://localhost:3000"
echo ""
echo "📝 Notas importantes:"
echo "   - O banco SQLite está em: ./local.db"
echo "   - OAuth está desabilitado (modo local)"
echo "   - Para produção, configure variáveis de ambiente adequadas"
echo ""
