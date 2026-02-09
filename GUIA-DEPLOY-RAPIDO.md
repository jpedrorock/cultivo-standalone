# ⚡ Guia Rápido de Deploy - PlanetScale + Vercel

## 🎯 Resumo em 10 Passos

Para quem quer fazer deploy rápido sem ler os guias completos.

---

### 1️⃣ PlanetScale (Banco de Dados)

```bash
# 1. Criar conta: https://planetscale.com (login com GitHub)
# 2. New database → Nome: cultivo-app → Region: us-east-1 → Create
# 3. Connect → New password → Nome: producao → Create
# 4. COPIAR a DATABASE_URL completa (só aparece uma vez!)
```

**Exemplo de URL:**
```
mysql://xxx:yyy@aws.connect.psdb.cloud/cultivo-app?sslaccept=strict
```

---

### 2️⃣ Criar Tabelas no Banco

No PlanetScale, aba **Console**, cole e rode:

```sql
CREATE TABLE tents (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, tentType ENUM('INDOOR', 'OUTDOOR', 'GREENHOUSE') NOT NULL, width DECIMAL(5,2), depth DECIMAL(5,2), height DECIMAL(5,2), volume DECIMAL(8,2), powerW INT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE strains (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, type ENUM('INDICA', 'SATIVA', 'HYBRID', 'RUDERALIS') NOT NULL, vegaDays INT DEFAULT 28, floraDays INT DEFAULT 56, notes TEXT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE cycles (id INT AUTO_INCREMENT PRIMARY KEY, tentId INT NOT NULL, strainId INT NOT NULL, startDate DATE NOT NULL, floraStartDate DATE, status ENUM('ACTIVE', 'COMPLETED', 'ABORTED') DEFAULT 'ACTIVE', createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (tentId) REFERENCES tents(id), FOREIGN KEY (strainId) REFERENCES strains(id));

CREATE TABLE dailyLogs (id INT AUTO_INCREMENT PRIMARY KEY, tentId INT NOT NULL, logDate DATE NOT NULL, turn ENUM('AM', 'PM') NOT NULL, tempC DECIMAL(4,1), rhPct DECIMAL(4,1), ppfd INT, ph DECIMAL(3,1), ec DECIMAL(4,2), notes TEXT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (tentId) REFERENCES tents(id), INDEX idx_tent_date (tentId, logDate));

CREATE TABLE weeklyTargets (id INT AUTO_INCREMENT PRIMARY KEY, strainId INT NOT NULL, phase ENUM('VEGA', 'FLORA') NOT NULL, weekNumber INT NOT NULL, tempMin DECIMAL(4,1), tempMax DECIMAL(4,1), rhMin DECIMAL(4,1), rhMax DECIMAL(4,1), ppfdMin INT, ppfdMax INT, photoperiod VARCHAR(10), phMin DECIMAL(3,1), phMax DECIMAL(3,1), ecMin DECIMAL(4,2), ecMax DECIMAL(4,2), notes TEXT, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (strainId) REFERENCES strains(id), UNIQUE KEY unique_strain_phase_week (strainId, phase, weekNumber));

CREATE TABLE alerts (id INT AUTO_INCREMENT PRIMARY KEY, tentId INT NOT NULL, type ENUM('TEMP_HIGH', 'TEMP_LOW', 'RH_HIGH', 'RH_LOW', 'PPFD_LOW', 'PH_HIGH', 'PH_LOW', 'EC_HIGH', 'EC_LOW', 'CUSTOM') NOT NULL, severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM', message TEXT NOT NULL, value DECIMAL(10,2), threshold DECIMAL(10,2), status ENUM('NEW', 'ACKNOWLEDGED', 'RESOLVED') DEFAULT 'NEW', createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, acknowledgedAt TIMESTAMP NULL, resolvedAt TIMESTAMP NULL, FOREIGN KEY (tentId) REFERENCES tents(id), INDEX idx_status (status), INDEX idx_tent_status (tentId, status));

CREATE TABLE alertSettings (id INT AUTO_INCREMENT PRIMARY KEY, tentId INT NOT NULL, emailEnabled BOOLEAN DEFAULT false, emailAddress VARCHAR(255), smsEnabled BOOLEAN DEFAULT false, phoneNumber VARCHAR(20), tempHighThreshold DECIMAL(4,1), tempLowThreshold DECIMAL(4,1), rhHighThreshold DECIMAL(4,1), rhLowThreshold DECIMAL(4,1), ppfdLowThreshold INT, phHighThreshold DECIMAL(3,1), phLowThreshold DECIMAL(3,1), ecHighThreshold DECIMAL(4,2), ecLowThreshold DECIMAL(4,2), createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (tentId) REFERENCES tents(id), UNIQUE KEY unique_tent (tentId));
```

---

### 3️⃣ GitHub (Código)

```bash
# No terminal, dentro da pasta do projeto:
git init
git add .
git commit -m "Initial commit"

# Criar repositório no GitHub: https://github.com/new
# Nome: app-cultivo, Private

# Substituir SEU-USUARIO pelo seu usuário do GitHub:
git remote add origin https://github.com/SEU-USUARIO/app-cultivo.git
git push -u origin main
```

---

### 4️⃣ Vercel (Hospedagem)

```bash
# 1. Criar conta: https://vercel.com (login com GitHub)
# 2. Add New → Project → Importar app-cultivo
# 3. Framework: Vite (auto-detectado)
# 4. Install Command: npm install --legacy-peer-deps
# 5. Build Command: npm run build (deixar)
# 6. Output Directory: dist (deixar)
```

---

### 5️⃣ Variáveis de Ambiente no Vercel

Antes de clicar em Deploy, adicione:

| Name | Value |
|------|-------|
| `DATABASE_URL` | *(cole a URL do PlanetScale)* |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

---

### 6️⃣ Deploy

```bash
# Clique em "Deploy" no Vercel
# Aguarde 2-5 minutos
# Acesse a URL gerada: https://app-cultivo-xyz.vercel.app
```

---

### 7️⃣ Domínio Customizado (Opcional)

No Vercel:
1. Settings → Domains
2. Adicione: `cultivo.seudominio.com.br`
3. Configure CNAME no seu provedor:
   - **Type:** CNAME
   - **Name:** cultivo
   - **Value:** cname.vercel-dns.com

---

### 8️⃣ Testar

Acesse o site e teste:
- ✅ Criar estufa
- ✅ Adicionar strain
- ✅ Iniciar ciclo
- ✅ Registrar log diário

---

### 9️⃣ Deploy Automático

Toda vez que fizer mudanças:

```bash
git add .
git commit -m "Nova funcionalidade"
git push
```

O Vercel faz deploy automático em 2-5 minutos!

---

### 🔟 Monitoramento

- **PlanetScale:** https://app.planetscale.com → Ver uso do banco
- **Vercel:** https://vercel.com/dashboard → Ver logs e analytics

---

## 🆘 Problemas?

### Erro de banco no Vercel:
1. Vercel → Settings → Environment Variables
2. Verifique se `DATABASE_URL` está correta
3. Redeploy

### Build failed:
1. Teste localmente: `npm run build`
2. Verifique se adicionou `--legacy-peer-deps`
3. Veja os logs no Vercel

### Domínio não funciona:
1. Aguarde até 48h para DNS propagar
2. Verifique CNAME: https://dnschecker.org

---

## 📚 Guias Detalhados

Para mais detalhes, veja:
- `GUIA-PLANETSCALE.md` - Setup completo do banco
- `GUIA-VERCEL.md` - Deploy e domínio customizado

---

## 💰 Custos

**Total: R$ 0,00/mês**

- PlanetScale: Gratuito até 5GB
- Vercel: Gratuito ilimitado (projetos pessoais)
- SSL: Incluído gratuito
- Domínio: Você já tem (só configurar CNAME)

---

## 🎉 Pronto!

Seu app está no ar, gratuito, com SSL e domínio customizado!

**Próximos passos:**
1. Adicionar dados de exemplo
2. Configurar alertas
3. Personalizar branding
4. Compartilhar com a equipe
