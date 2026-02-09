#!/bin/bash

# Script para baixar bindings pré-compilados do better-sqlite3
# Resolve problema do pnpm que ignora build scripts

set -e

echo "🔧 Baixando bindings pré-compilados do better-sqlite3..."

# Detectar plataforma e arquitetura
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Mapear arquitetura para formato do better-sqlite3
case "$ARCH" in
    x86_64)
        ARCH="x64"
        ;;
    arm64|aarch64)
        ARCH="arm64"
        ;;
    *)
        echo "❌ Arquitetura não suportada: $ARCH"
        exit 1
        ;;
esac

# Mapear OS para formato do better-sqlite3
case "$OS" in
    darwin)
        PLATFORM="darwin"
        ;;
    linux)
        PLATFORM="linux"
        ;;
    *)
        echo "❌ Sistema operacional não suportado: $OS"
        exit 1
        ;;
esac

# Versão do Node.js
NODE_VERSION=$(node -p "process.versions.modules")
echo "ℹ️  Plataforma: $PLATFORM-$ARCH (Node ABI: v$NODE_VERSION)"

# Diretório do better-sqlite3
SQLITE_DIR="node_modules/.pnpm/better-sqlite3@12.6.2/node_modules/better-sqlite3"

if [ ! -d "$SQLITE_DIR" ]; then
    echo "❌ better-sqlite3 não encontrado em node_modules"
    echo "   Execute 'pnpm install' primeiro"
    exit 1
fi

# Criar diretório para bindings
BINDING_DIR="$SQLITE_DIR/lib/binding/node-v$NODE_VERSION-$PLATFORM-$ARCH"
mkdir -p "$BINDING_DIR"

# URL do binding pré-compilado (GitHub releases do better-sqlite3)
VERSION="12.6.2"
BINDING_FILE="better_sqlite3.node"
DOWNLOAD_URL="https://github.com/WiseLibs/better-sqlite3/releases/download/v${VERSION}/better-sqlite3-v${VERSION}-node-v${NODE_VERSION}-${PLATFORM}-${ARCH}.tar.gz"

echo "📥 Baixando de: $DOWNLOAD_URL"

# Tentar baixar
if curl -L -f "$DOWNLOAD_URL" -o /tmp/better-sqlite3-binding.tar.gz 2>/dev/null; then
    echo "✅ Download concluído"
    
    # Extrair
    cd "$BINDING_DIR"
    tar -xzf /tmp/better-sqlite3-binding.tar.gz
    rm /tmp/better-sqlite3-binding.tar.gz
    
    if [ -f "$BINDING_FILE" ]; then
        echo "✅ Bindings instalados com sucesso!"
        echo "   Localização: $BINDING_DIR/$BINDING_FILE"
        exit 0
    else
        echo "❌ Arquivo $BINDING_FILE não encontrado após extração"
        exit 1
    fi
else
    echo "⚠️  Binding pré-compilado não disponível para esta plataforma"
    echo ""
    echo "Você precisa compilar manualmente:"
    echo "  1. Instale ferramentas de compilação:"
    echo "     macOS: xcode-select --install"
    echo "     Linux: sudo apt install build-essential python3"
    echo ""
    echo "  2. Compile o better-sqlite3:"
    echo "     cd $SQLITE_DIR"
    echo "     npm run build-release"
    echo ""
    exit 1
fi
