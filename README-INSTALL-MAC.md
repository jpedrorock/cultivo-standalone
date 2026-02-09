# 🍎 Instalação no macOS - App Cultivo

## ⚡ Instalação Rápida (Recomendado)

```bash
bash install-cultivo-final.sh
```

Este script faz **tudo automaticamente**:
- ✅ Verifica MySQL 8.0
- ✅ Cria usuário `cultivo` com senha `cultivo123`
- ✅ Cria banco `cultivo_app`
- ✅ Instala dependências
- ✅ Inicializa tabelas
- ✅ Verifica instalação

**Tempo:** ~3 minutos

---

## 📋 Requisitos

### 1. MySQL 8.0 (NÃO use MySQL 9.x)

**Por que MySQL 8.0?**
- ✅ Compatível com Drizzle ORM
- ✅ Sem problemas de política de senha
- ✅ Estável e testado

**Instalar:**
```bash
brew install mysql@8.0
brew services start mysql@8.0
```

**Verificar:**
```bash
/opt/homebrew/opt/mysql@8.0/bin/mysql --version
# Deve mostrar: mysql  Ver 8.0.x
```

### 2. Node.js 18+

```bash
node -v  # Deve ser v18 ou superior
```

---

## 🔧 Instalação Manual

Se preferir fazer passo a passo:

### 1. Instalar MySQL 8.0

```bash
# Remover MySQL 9.x se tiver
brew services stop mysql
brew uninstall mysql

# Instalar MySQL 8.0
brew install mysql@8.0
brew services start mysql@8.0
```

### 2. Configurar Senha do Root

```bash
/opt/homebrew/opt/mysql@8.0/bin/mysql_secure_installation
```

Responda:
- Set root password? **Y** (escolha uma senha)
- Remove anonymous users? **Y**
- Disallow root login remotely? **Y**
- Remove test database? **Y**
- Reload privilege tables? **Y**

### 3. Criar Usuário e Banco

```bash
/opt/homebrew/opt/mysql@8.0/bin/mysql -u root -p
```

No MySQL:
```sql
CREATE USER 'cultivo'@'localhost' IDENTIFIED BY 'cultivo123';
CREATE DATABASE cultivo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON cultivo_app.* TO 'cultivo'@'localhost';
FLUSH PRIVILEGES;
exit;
```

### 4. Configurar .env

```bash
cat > .env << 'EOF'
DATABASE_URL=mysql://cultivo:cultivo123@localhost:3306/cultivo_app
NODE_ENV=development
JWT_SECRET=dev-secret-key
OAUTH_SERVER_URL=http://localhost:3000
OWNER_NAME=Test User
OWNER_OPEN_ID=test-user-id
VITE_APP_TITLE=Cultivo App
EOF
```

### 5. Instalar Dependências

```bash
npm install --legacy-peer-deps
npm install react-is --legacy-peer-deps
```

### 6. Inicializar Banco

```bash
npm run db:push
```

### 7. Iniciar Servidor

```bash
npm run dev
```

Abra: http://localhost:3000

---

## 🐛 Solução de Problemas

### Erro: "MySQL 9.6 incompatível"

**Problema:** MySQL 9.x tem mudanças que quebram compatibilidade

**Solução:**
```bash
brew services stop mysql
brew uninstall mysql
brew install mysql@8.0
brew services start mysql@8.0
```

### Erro: "Can't connect to MySQL server"

**Causa:** MySQL não está rodando

**Solução:**
```bash
brew services start mysql@8.0
```

### Erro: "Access denied for user 'root'"

**Causa:** Senha incorreta ou não configurada

**Solução:**
```bash
/opt/homebrew/opt/mysql@8.0/bin/mysql_secure_installation
```

### Erro: "Unknown database 'cultivo_app'"

**Causa:** Banco não foi criado

**Solução:**
```bash
/opt/homebrew/opt/mysql@8.0/bin/mysql -u root -p -e "CREATE DATABASE cultivo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Erro: "Your password does not satisfy policy"

**Causa:** MySQL 9.x tem política de senha mais restritiva

**Solução:** Use MySQL 8.0 ao invés de 9.x

### Erro: "Could not resolve 'react-is'"

**Causa:** Dependência faltando

**Solução:**
```bash
npm install react-is --legacy-peer-deps
```

---

## 🔄 Comandos Úteis

```bash
# Ver status do MySQL
brew services list

# Parar MySQL
brew services stop mysql@8.0

# Reiniciar MySQL
brew services restart mysql@8.0

# Conectar ao MySQL
/opt/homebrew/opt/mysql@8.0/bin/mysql -u cultivo -p
# Senha: cultivo123

# Ver tabelas
/opt/homebrew/opt/mysql@8.0/bin/mysql -u cultivo -p cultivo_app -e "SHOW TABLES;"

# Backup do banco
/opt/homebrew/opt/mysql@8.0/bin/mysqldump -u cultivo -p cultivo_app > backup.sql

# Restaurar backup
/opt/homebrew/opt/mysql@8.0/bin/mysql -u cultivo -p cultivo_app < backup.sql

# Resetar banco (cuidado!)
/opt/homebrew/opt/mysql@8.0/bin/mysql -u cultivo -p -e "DROP DATABASE cultivo_app; CREATE DATABASE cultivo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
npm run db:push
```

---

## 📊 Estrutura do Banco

Após instalação, o banco terá:

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

---

## 🔐 Credenciais Padrão

**Para Desenvolvimento Local:**
- **Usuário:** cultivo
- **Senha:** cultivo123
- **Banco:** cultivo_app
- **Host:** localhost:3306

**Para Produção:**
- ⚠️ Mude a senha!
- ⚠️ Configure SSL/TLS
- ⚠️ Faça backups regulares

---

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Aplicar migrações do banco
npm run db:push

# Verificar tipos TypeScript
npm run check

# Formatar código
npm run format

# Rodar testes
npm test
```

---

## 📚 Diferenças MySQL 8.0 vs 9.6

| Recurso | MySQL 8.0 | MySQL 9.6 |
|---------|-----------|-----------|
| **Compatibilidade Drizzle** | ✅ Total | ⚠️ Parcial |
| **Política de Senha** | Flexível | Muito restritiva |
| **Estabilidade** | Produção | Beta/Experimental |
| **Suporte Homebrew** | Oficial | Recente |
| **Recomendação** | ✅ **Use esta** | ❌ Evite |

---

## 🆘 Ainda com Problemas?

1. **Verifique os requisitos:**
   ```bash
   /opt/homebrew/opt/mysql@8.0/bin/mysql --version  # Deve ser 8.0.x
   node -v  # Deve ser 18+
   ```

2. **Verifique logs do MySQL:**
   ```bash
   tail -f /opt/homebrew/var/mysql/*.err
   ```

3. **Teste conexão:**
   ```bash
   /opt/homebrew/opt/mysql@8.0/bin/mysql -u cultivo -p cultivo_app -e "SELECT 1;"
   ```

4. **Reinstale do zero:**
   ```bash
   bash install-cultivo-final.sh
   ```

---

**Versão:** 3.2.0  
**Data:** Fevereiro 2026  
**Testado em:** macOS Sonoma (Apple Silicon M1/M2/M3)  
**MySQL:** 8.0.x (Recomendado)
