#!/bin/bash

# ============================================
# App Cultivo - Script de Empacotamento
# ============================================
# Gera um arquivo ZIP completo para distribuição

set -e  # Exit on error

echo "📦 Iniciando empacotamento do App Cultivo..."

# Variáveis
VERSION="2.0.4"
RELEASE_NAME="app-cultivo-v${VERSION}"
RELEASE_DIR="./releases"
TEMP_DIR="${RELEASE_DIR}/${RELEASE_NAME}"

# Criar diretório de releases
mkdir -p "${RELEASE_DIR}"
rm -rf "${TEMP_DIR}"
mkdir -p "${TEMP_DIR}"

echo "📋 Copiando arquivos do projeto..."

# Copiar arquivos essenciais
cp -r client "${TEMP_DIR}/"
cp -r server "${TEMP_DIR}/"
cp -r drizzle "${TEMP_DIR}/"
cp -r shared "${TEMP_DIR}/"
[ -d storage ] && cp -r storage "${TEMP_DIR}/" || echo "⚠️  storage directory not found, skipping..."
[ -d patches ] && cp -r patches "${TEMP_DIR}/" || echo "⚠️  patches directory not found, skipping..."

# Copiar arquivos de configuração
cp package.json "${TEMP_DIR}/"
cp pnpm-lock.yaml "${TEMP_DIR}/"
cp tsconfig.json "${TEMP_DIR}/"
cp vite.config.ts "${TEMP_DIR}/"
cp drizzle.config.ts "${TEMP_DIR}/"
cp vitest.config.ts "${TEMP_DIR}/"
cp .prettierrc "${TEMP_DIR}/"
cp .prettierignore "${TEMP_DIR}/"

# Copiar documentação
cp README-MYSQL.md "${TEMP_DIR}/README.md"
[ -f GUIA-COMPLETO.md ] && cp GUIA-COMPLETO.md "${TEMP_DIR}/" || true
[ -f QUICK-START.md ] && cp QUICK-START.md "${TEMP_DIR}/" || true
[ -f CHANGELOG.md ] && cp CHANGELOG.md "${TEMP_DIR}/" || true
[ -f .env.example ] && cp .env.example "${TEMP_DIR}/" || echo "⚠️  .env.example not found, skipping..."

# Copiar banco de dados inicial (MySQL)
cp banco-inicial.sql "${TEMP_DIR}/"

# Copiar pasta de migrações
[ -d migrations ] && cp -r migrations "${TEMP_DIR}/" || echo "⚠️  migrations directory not found, skipping..."

# Copiar MIGRATION.md
[ -f MIGRATION.md ] && cp MIGRATION.md "${TEMP_DIR}/" || echo "⚠️  MIGRATION.md not found, skipping..."

# Copiar instalador MySQL
cp install-mysql.sh "${TEMP_DIR}/"
chmod +x "${TEMP_DIR}/install-mysql.sh"

# Criar .gitignore para o release
cat > "${TEMP_DIR}/.gitignore" << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
*.dist

# Database
*.db
*.sqlite
*.sqlite3

# Logs
*.log
.manus-logs/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Temp
*.tmp
*.bak
EOF

echo "🗑️  Removendo arquivos desnecessários..."

# Remover arquivos de desenvolvimento e node_modules (forçar instalação limpa)
rm -rf "${TEMP_DIR}/node_modules" 2>/dev/null || true
rm -rf "${TEMP_DIR}/client/node_modules" 2>/dev/null || true
rm -rf "${TEMP_DIR}/server/node_modules" 2>/dev/null || true
rm -rf "${TEMP_DIR}/.git" 2>/dev/null || true
rm -rf "${TEMP_DIR}/dist" 2>/dev/null || true
# NÃO remover local.db - é o banco pré-populado!
rm -rf "${TEMP_DIR}/.manus-logs" 2>/dev/null || true

echo "📝 Criando arquivo de versão..."

cat > "${TEMP_DIR}/VERSION.txt" << EOF
App Cultivo
Versão: ${VERSION}
Data: $(date +"%Y-%m-%d %H:%M:%S")
Build: $(git rev-parse --short HEAD 2>/dev/null || echo "local")
EOF

echo "🗜️  Compactando arquivos..."

# Criar ZIP
cd "${RELEASE_DIR}"
zip -r "${RELEASE_NAME}.zip" "${RELEASE_NAME}" -q

# Limpar diretório temporário
rm -rf "${RELEASE_NAME}"

cd ..

echo "✅ Empacotamento concluído!"
echo "📦 Arquivo gerado: ${RELEASE_DIR}/${RELEASE_NAME}.zip"
echo "📏 Tamanho: $(du -h "${RELEASE_DIR}/${RELEASE_NAME}.zip" | cut -f1)"

# Gerar checksum
echo "🔐 Gerando checksum..."
cd "${RELEASE_DIR}"
sha256sum "${RELEASE_NAME}.zip" > "${RELEASE_NAME}.zip.sha256"
cd ..

echo "✅ Checksum gerado: ${RELEASE_DIR}/${RELEASE_NAME}.zip.sha256"
echo ""
echo "🎉 Pronto para distribuição!"
