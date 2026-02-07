#!/bin/bash

# ============================================
# MySQL to SQLite SQL Converter
# ============================================
# Converts MySQL dump to SQLite-compatible SQL

if [ $# -lt 2 ]; then
    echo "Usage: $0 <input-mysql.sql> <output-sqlite.sql>"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_FILE="$2"

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file not found: $INPUT_FILE"
    exit 1
fi

echo "Converting MySQL SQL to SQLite format..."

# Convert MySQL syntax to SQLite
sed -e 's/SET FOREIGN_KEY_CHECKS=0;/PRAGMA foreign_keys=OFF;/g' \
    -e 's/SET FOREIGN_KEY_CHECKS=1;/PRAGMA foreign_keys=ON;/g' \
    -e '/^SET /d' \
    -e '/^\/\*![0-9]* /d' \
    -e 's/ AUTO_INCREMENT=[0-9]*//g' \
    -e 's/ DEFAULT CHARSET=[a-z0-9]*//g' \
    -e 's/ COLLATE=[a-z0-9_]*//g' \
    -e 's/ ENGINE=[A-Za-z]*//g' \
    -e 's/\\"/"/g' \
    -e "s/\\\\'/'/g" \
    "$INPUT_FILE" > "$OUTPUT_FILE"

echo "✅ Conversion complete: $OUTPUT_FILE"
