# App Cultivo - Instalação Local (MySQL)

Versão 2.0 - Compatível 100% com o ambiente Manus

## 🚀 Instalação Rápida

```bash
bash install-mysql.sh
pnpm dev
```

Acesse: http://localhost:3000

## 📋 Pré-requisitos

### 1. Node.js 18+

**macOS:**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install nodejs npm
```

**Windows:**  
Download: https://nodejs.org/

### 2. MySQL 8.0+

**macOS:**
```bash
# Instalar
brew install mysql

# Iniciar serviço
brew services start mysql

# (Opcional) Configurar senha root
mysql_secure_installation
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

**Windows:**  
Download: https://dev.mysql.com/downloads/mysql/

## 🔧 Instalação Manual

Se preferir instalar manualmente:

### 1. Instalar dependências
```bash
pnpm install
```

### 2. Criar database
```bash
mysql -u root -e "CREATE DATABASE cultivo_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3. Importar dados
```bash
mysql -u root cultivo_local < banco-inicial.sql
```

### 4. Configurar .env
```bash
cat > .env << EOF
DATABASE_URL="mysql://root@localhost:3306/cultivo_local"
NODE_ENV=development
PORT=3000
EOF
```

### 5. Iniciar servidor
```bash
pnpm dev
```

## 📊 Dados Incluídos

O banco vem pré-populado com:

- **3 Estufas** (A, B, C) com dimensões configuradas
- **6 Strains** (Blue Dream, Northern Lights, White Widow, etc)
- **6 Ciclos** (ativos e finalizados)
- **Registros diários** de temperatura, umidade, PPFD
- **Alvos semanais** para cada fase
- **Tarefas** configuradas

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
pnpm dev              # Iniciar servidor (http://localhost:3000)
pnpm build            # Build para produção
pnpm test             # Rodar testes

# Banco de dados
pnpm db:push          # Aplicar mudanças no schema

# Backup manual
mysqldump -u root cultivo_local > backup-$(date +%Y%m%d).sql

# Restaurar backup
mysql -u root cultivo_local < backup-20260207.sql
```

## 🔐 MySQL com Senha

Se seu MySQL tem senha root:

```bash
# Criar database
mysql -u root -p -e "CREATE DATABASE cultivo_local;"

# Importar dados
mysql -u root -p cultivo_local < banco-inicial.sql

# Configurar .env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/cultivo_local"
```

## 🐛 Troubleshooting

### Erro: "MySQL não encontrado"
```bash
# macOS
brew install mysql
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Erro: "Access denied for user 'root'"
```bash
# Resetar senha root (macOS)
mysql.server stop
mysqld_safe --skip-grant-tables &
mysql -u root
# No MySQL:
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nova_senha';
```

### Erro: "Can't connect to MySQL server"
```bash
# Verificar se MySQL está rodando
# macOS
brew services list | grep mysql

# Linux
sudo systemctl status mysql
```

### Porta 3000 ocupada
```bash
# Mudar porta no .env
PORT=3001
```

## 💾 Backup e Restauração

### Backup Automático

Adicione ao crontab para backup diário:
```bash
0 2 * * * mysqldump -u root cultivo_local > ~/backups/cultivo-$(date +\%Y\%m\%d).sql
```

### Exportar para Manus

1. Faça backup local:
```bash
mysqldump -u root cultivo_local > export-to-manus.sql
```

2. Na interface do Manus, vá em Configurações → Importar Banco de Dados

3. Selecione o arquivo `export-to-manus.sql`

## 📦 Estrutura do Projeto

```
app-cultivo-v2.0.0/
├── client/              # Frontend React
├── server/              # Backend Express + tRPC
├── drizzle/             # Database schema
├── banco-inicial.sql    # Dados iniciais (MySQL)
├── install-mysql.sh     # Instalador automático
├── package.json
└── README-MYSQL.md      # Este arquivo
```

## 🔄 Sincronização com Manus

Como ambos usam MySQL, você pode:

1. **Exportar do Manus** → Importar localmente
2. **Exportar local** → Importar no Manus
3. **Usar mesmo schema** → Compatibilidade total

## 📞 Suporte

Para problemas ou dúvidas:
- Verifique o troubleshooting acima
- Consulte a documentação do MySQL
- Revise os logs do servidor

## 📝 Changelog

### v2.0.0
- Migrado de SQLite para MySQL
- Compatibilidade 100% com Manus
- Instalador automático com detecção de MySQL
- Backup e restauração simplificados
