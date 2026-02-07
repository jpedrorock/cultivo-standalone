#!/bin/bash

# Script para adicionar ON DELETE CASCADE automaticamente
# Descobre os nomes reais das foreign keys e as recria com CASCADE

set -e

echo "🔧 Migração: Adicionar ON DELETE CASCADE"
echo ""

# Verificar se mysql está disponível
if ! command -v mysql &> /dev/null; then
    echo "❌ Erro: mysql não encontrado"
    exit 1
fi

# Pedir credenciais
read -p "Digite o usuário MySQL (padrão: root): " MYSQL_USER
MYSQL_USER=${MYSQL_USER:-root}

read -sp "Digite a senha MySQL: " MYSQL_PASS
echo ""

read -p "Digite o nome do database (padrão: cultivo_local): " DB_NAME
DB_NAME=${DB_NAME:-cultivo_local}

echo ""
echo "🔍 Descobrindo foreign keys existentes..."

# Função para recriar FK com CASCADE
recreate_fk() {
    local table=$1
    local column=$2
    local ref_table=$3
    local ref_column=$4
    
    # Descobrir nome da FK
    FK_NAME=$(mysql -u"$MYSQL_USER" -p"$MYSQL_PASS" -D"$DB_NAME" -sN -e "
        SELECT CONSTRAINT_NAME 
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = '$DB_NAME'
          AND TABLE_NAME = '$table'
          AND COLUMN_NAME = '$column'
          AND REFERENCED_TABLE_NAME = '$ref_table'
        LIMIT 1;
    " 2>/dev/null)
    
    if [ -z "$FK_NAME" ]; then
        echo "⚠️  FK não encontrada: $table.$column → $ref_table.$ref_column"
        return
    fi
    
    echo "  ✓ Processando: $table.$column ($FK_NAME)"
    
    # Dropar FK antiga
    mysql -u"$MYSQL_USER" -p"$MYSQL_PASS" -D"$DB_NAME" -e "
        ALTER TABLE \`$table\` DROP FOREIGN KEY \`$FK_NAME\`;
    " 2>/dev/null
    
    # Criar FK nova com CASCADE
    mysql -u"$MYSQL_USER" -p"$MYSQL_PASS" -D"$DB_NAME" -e "
        ALTER TABLE \`$table\` 
        ADD CONSTRAINT \`${table}_${column}_fk\` 
        FOREIGN KEY (\`$column\`) REFERENCES \`$ref_table\`(\`$ref_column\`) 
        ON DELETE CASCADE;
    " 2>/dev/null
}

echo ""
echo "🔄 Aplicando ON DELETE CASCADE..."

# Desabilitar checks temporariamente
mysql -u"$MYSQL_USER" -p"$MYSQL_PASS" -D"$DB_NAME" -e "SET FOREIGN_KEY_CHECKS=0;" 2>/dev/null

# Recriar todas as FKs
recreate_fk "cycles" "tentId" "tents" "id"
recreate_fk "cycles" "strainId" "strains" "id"
recreate_fk "dailyLogs" "tentId" "tents" "id"
recreate_fk "weeklyTargets" "cycleId" "cycles" "id"
recreate_fk "tasks" "tentId" "tents" "id"
recreate_fk "taskInstances" "taskId" "tasks" "id"
recreate_fk "alerts" "tentId" "tents" "id"
recreate_fk "alertHistory" "alertId" "alerts" "id"
recreate_fk "nutrientLogs" "cycleId" "cycles" "id"
recreate_fk "harvestLogs" "cycleId" "cycles" "id"

# Reabilitar checks
mysql -u"$MYSQL_USER" -p"$MYSQL_PASS" -D"$DB_NAME" -e "SET FOREIGN_KEY_CHECKS=1;" 2>/dev/null

echo ""
echo "✅ Migração concluída com sucesso!"
echo ""
echo "🔍 Verificando resultado..."

# Verificar CASCADE
mysql -u"$MYSQL_USER" -p"$MYSQL_PASS" -D"$DB_NAME" -e "
    SELECT 
      TABLE_NAME as 'Tabela',
      COLUMN_NAME as 'Coluna',
      CONSTRAINT_NAME as 'Constraint',
      REFERENCED_TABLE_NAME as 'Referencia',
      DELETE_RULE as 'Delete Rule'
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = '$DB_NAME'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    ORDER BY TABLE_NAME;
" 2>/dev/null

echo ""
echo "✅ Todas as foreign keys devem mostrar DELETE_RULE = 'CASCADE'"
