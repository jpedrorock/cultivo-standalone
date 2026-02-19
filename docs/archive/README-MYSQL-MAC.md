# 🍎 Instalação MySQL no macOS - App Cultivo

## 🎯 Por que MySQL ao invés de SQLite?

O App Cultivo foi desenvolvido com **MySQL** como banco de dados principal. Usar MySQL localmente garante:

✅ **Compatibilidade total** - Schema já pronto, sem conversões  
✅ **Mesma experiência** - Desenvolvimento idêntico à produção  
✅ **Sem erros de sintaxe** - MySQL suporta todas as funções usadas (`NOW()`, `ENUM`, etc.)  
✅ **Mais robusto** - Melhor para dados reais e múltiplos usuários  

## 📦 Instalação Automática (Recomendado)

```bash
bash install-mysql-mac.sh
```

Este script faz tudo automaticamente:
1. ✅ Instala Homebrew (se necessário)
2. ✅ Instala Node.js (se necessário)
3. ✅ Instala MySQL via Homebrew
4. ✅ Cria banco de dados `cultivo_app`
5. ✅ Configura `.env` com credenciais
6. ✅ Instala dependências npm
7. ✅ Cria tabelas e insere dados de exemplo
8. ✅ Testa conexão

## 🔧 Instalação Manual

### 1. Instalar Homebrew (se não tiver)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Instalar MySQL

```bash
brew install mysql
brew services start mysql
```

### 3. Criar Banco de Dados

```bash
mysql -u root -e "CREATE DATABASE cultivo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 4. Configurar Senha (Opcional mas Recomendado)

```bash
mysql_secure_installation
```

Siga as instruções:
- Set root password? **Y** (escolha uma senha forte)
- Remove anonymous users? **Y**
- Disallow root login remotely? **Y**
- Remove test database? **Y**
- Reload privilege tables? **Y**

### 5. Configurar .env

Crie arquivo `.env` na raiz do projeto:

```bash
# Sem senha
DATABASE_URL=mysql://root@localhost:3306/cultivo_app

# Com senha (substitua SUA_SENHA)
DATABASE_URL=mysql://root:SUA_SENHA@localhost:3306/cultivo_app

# Server
NODE_ENV=development
PORT=3000

# Optional: Analytics (deixe vazio para desenvolvimento local)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=

# Optional: OAuth (deixe vazio para desenvolvimento local)
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
```

### 6. Instalar Dependências

```bash
npm install --legacy-peer-deps
```

### 7. Inicializar Banco de Dados

```bash
node init-mysql.mjs
```

### 8. Iniciar Servidor

```bash
npm run dev
```

Abra: http://localhost:3000

## 📊 Dados de Exemplo Incluídos

O script `init-mysql.mjs` cria automaticamente:

- **1 Estufa** - "Estufa Principal" (tipo B, 120x120x200cm, 600W)
- **1 Strain** - "Strain Exemplo" (4 semanas vega + 8 semanas flora)
- **1 Ciclo Ativo** - Iniciado há 30 dias, flora há 2 dias
- **30 Registros de Logs** - 15 dias de histórico (manhã + noite)
  - Temperatura: 22-28°C
  - Umidade: 50-70%
  - PPFD: 400-700 µmol/m²/s
  - pH: 5.8-6.5
  - EC: 1.2-1.8 mS/cm
- **12 Targets Semanais** - 4 semanas VEGA + 8 semanas FLORA

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Verificar tipos TypeScript
npm run check

# Formatar código
npm run format

# Rodar testes
npm test

# Aplicar migrações do banco
npm run db:push
```

## 🐛 Solução de Problemas

### Erro: "Can't connect to MySQL server"

**Causa:** MySQL não está rodando

**Solução:**
```bash
brew services start mysql
```

### Erro: "Access denied for user 'root'@'localhost'"

**Causa:** Senha incorreta no .env

**Solução:**
```bash
# Resetar senha do MySQL
mysql.server stop
mysqld_safe --skip-grant-tables &
mysql -u root

# No prompt do MySQL:
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'nova_senha';
exit;

# Atualizar .env com a nova senha
DATABASE_URL=mysql://root:nova_senha@localhost:3306/cultivo_app
```

### Erro: "Unknown database 'cultivo_app'"

**Causa:** Banco de dados não foi criado

**Solução:**
```bash
mysql -u root -p -e "CREATE DATABASE cultivo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Erro: "ER_NOT_SUPPORTED_AUTH_MODE"

**Causa:** Plugin de autenticação incompatível

**Solução:**
```bash
mysql -u root -p

# No prompt do MySQL:
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'sua_senha';
FLUSH PRIVILEGES;
exit;
```

### Erro: "Port 3306 already in use"

**Causa:** Outra instância do MySQL rodando

**Solução:**
```bash
# Ver processos usando porta 3306
lsof -i :3306

# Parar MySQL
brew services stop mysql

# Reiniciar
brew services start mysql
```

## 🔄 Comandos Úteis MySQL

```bash
# Ver status do MySQL
brew services list

# Parar MySQL
brew services stop mysql

# Reiniciar MySQL
brew services restart mysql

# Conectar ao MySQL
mysql -u root -p

# Ver bancos de dados
mysql -u root -p -e "SHOW DATABASES;"

# Ver tabelas
mysql -u root -p cultivo_app -e "SHOW TABLES;"

# Backup do banco
mysqldump -u root -p cultivo_app > backup.sql

# Restaurar backup
mysql -u root -p cultivo_app < backup.sql

# Deletar banco (cuidado!)
mysql -u root -p -e "DROP DATABASE cultivo_app;"
```

## 📁 Estrutura do Banco de Dados

```
cultivo_app/
├── users              # Usuários do sistema
├── tents              # Estufas (A, B, C)
├── strains            # Variedades genéticas
├── cycles             # Ciclos de cultivo
├── dailyLogs          # Registros diários (AM/PM)
├── weeklyTargets      # Targets semanais por fase
├── tentAState         # Estado da Estufa A
├── cloningEvents      # Eventos de clonagem
├── safetyLimits       # Limites de segurança
├── alertSettings      # Configurações de alertas
├── recipes            # Receitas de fertilização
├── recipeTemplates    # Templates de receitas
├── taskTemplates      # Templates de tarefas
├── taskInstances      # Instâncias de tarefas
└── alerts             # Alertas ativos
```

## 🔐 Segurança

### Para Desenvolvimento Local:
- ✅ Senha do MySQL é opcional
- ✅ Conexão apenas localhost
- ✅ Dados de exemplo podem ser deletados

### Para Produção:
- ⚠️ **SEMPRE use senha forte**
- ⚠️ Configure firewall (porta 3306)
- ⚠️ Use SSL/TLS para conexões remotas
- ⚠️ Faça backups regulares

## 📚 Recursos Adicionais

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Homebrew MySQL Guide](https://formulae.brew.sh/formula/mysql)
- [Drizzle ORM Docs](https://orm.drizzle.team/)

## 🆘 Suporte

Se continuar com problemas:

1. **Verifique os requisitos:**
   ```bash
   node -v    # Deve ser 18+
   mysql --version  # Deve existir
   ```

2. **Verifique logs do MySQL:**
   ```bash
   tail -f /opt/homebrew/var/mysql/*.err
   ```

3. **Teste conexão:**
   ```bash
   mysql -u root -p -e "SELECT 1;"
   ```

---

**Versão:** 3.1.0  
**Data:** Fevereiro 2026  
**Testado em:** macOS Sonoma (Apple Silicon M1/M2/M3)
