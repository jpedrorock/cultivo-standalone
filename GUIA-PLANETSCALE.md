# 🗄️ Guia de Configuração - PlanetScale (Banco de Dados)

## O que é PlanetScale?

PlanetScale é um banco de dados MySQL serverless gratuito com:
- ✅ 5GB de armazenamento
- ✅ 1 bilhão de leituras/mês
- ✅ Backups automáticos
- ✅ SSL incluído
- ✅ Sem cartão de crédito necessário

---

## Passo 1: Criar Conta no PlanetScale

1. Acesse: https://planetscale.com
2. Clique em **"Sign up"**
3. Escolha **"Continue with GitHub"** (mais fácil)
4. Autorize o PlanetScale no GitHub

---

## Passo 2: Criar Banco de Dados

1. No dashboard, clique em **"New database"**
2. Preencha:
   - **Name:** `cultivo-app` (ou o nome que preferir)
   - **Region:** `AWS us-east-1` (mais próximo do Brasil)
   - **Plan:** Deixe em **"Hobby"** (gratuito)
3. Clique em **"Create database"**
4. Aguarde 30 segundos enquanto o banco é criado

---

## Passo 3: Obter Connection String

1. No banco criado, clique em **"Connect"**
2. Escolha **"Connect with: Prisma"** (funciona com Drizzle também)
3. Clique em **"New password"**
4. Dê um nome: `producao` ou `vercel`
5. Clique em **"Create password"**

Você verá algo assim:

```
DATABASE_URL='mysql://xxxxxxxxx:************@aws.connect.psdb.cloud/cultivo-app?sslaccept=strict'
```

6. **COPIE ESSA URL COMPLETA** (você vai precisar dela!)
7. ⚠️ **IMPORTANTE:** Essa senha só aparece uma vez! Salve em um lugar seguro.

---

## Passo 4: Criar Tabelas no Banco

### Opção A: Via Interface Web (Mais Fácil)

1. No PlanetScale, clique em **"Console"** (aba ao lado de "Connect")
2. Cole o SQL abaixo e clique em **"Run"**:

```sql
-- Tabela de Estufas
CREATE TABLE tents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tentType ENUM('INDOOR', 'OUTDOOR', 'GREENHOUSE') NOT NULL,
  width DECIMAL(5,2),
  depth DECIMAL(5,2),
  height DECIMAL(5,2),
  volume DECIMAL(8,2),
  powerW INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Strains (Variedades)
CREATE TABLE strains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('INDICA', 'SATIVA', 'HYBRID', 'RUDERALIS') NOT NULL,
  vegaDays INT DEFAULT 28,
  floraDays INT DEFAULT 56,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Ciclos
CREATE TABLE cycles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tentId INT NOT NULL,
  strainId INT NOT NULL,
  startDate DATE NOT NULL,
  floraStartDate DATE,
  status ENUM('ACTIVE', 'COMPLETED', 'ABORTED') DEFAULT 'ACTIVE',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tentId) REFERENCES tents(id),
  FOREIGN KEY (strainId) REFERENCES strains(id)
);

-- Tabela de Logs Diários
CREATE TABLE dailyLogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tentId INT NOT NULL,
  logDate DATE NOT NULL,
  turn ENUM('AM', 'PM') NOT NULL,
  tempC DECIMAL(4,1),
  rhPct DECIMAL(4,1),
  ppfd INT,
  ph DECIMAL(3,1),
  ec DECIMAL(4,2),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tentId) REFERENCES tents(id),
  INDEX idx_tent_date (tentId, logDate)
);

-- Tabela de Targets Semanais
CREATE TABLE weeklyTargets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  strainId INT NOT NULL,
  phase ENUM('VEGA', 'FLORA') NOT NULL,
  weekNumber INT NOT NULL,
  tempMin DECIMAL(4,1),
  tempMax DECIMAL(4,1),
  rhMin DECIMAL(4,1),
  rhMax DECIMAL(4,1),
  ppfdMin INT,
  ppfdMax INT,
  photoperiod VARCHAR(10),
  phMin DECIMAL(3,1),
  phMax DECIMAL(3,1),
  ecMin DECIMAL(4,2),
  ecMax DECIMAL(4,2),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (strainId) REFERENCES strains(id),
  UNIQUE KEY unique_strain_phase_week (strainId, phase, weekNumber)
);

-- Tabela de Alertas
CREATE TABLE alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tentId INT NOT NULL,
  type ENUM('TEMP_HIGH', 'TEMP_LOW', 'RH_HIGH', 'RH_LOW', 'PPFD_LOW', 'PH_HIGH', 'PH_LOW', 'EC_HIGH', 'EC_LOW', 'CUSTOM') NOT NULL,
  severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  message TEXT NOT NULL,
  value DECIMAL(10,2),
  threshold DECIMAL(10,2),
  status ENUM('NEW', 'ACKNOWLEDGED', 'RESOLVED') DEFAULT 'NEW',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledgedAt TIMESTAMP NULL,
  resolvedAt TIMESTAMP NULL,
  FOREIGN KEY (tentId) REFERENCES tents(id),
  INDEX idx_status (status),
  INDEX idx_tent_status (tentId, status)
);

-- Tabela de Configurações de Alertas
CREATE TABLE alertSettings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tentId INT NOT NULL,
  emailEnabled BOOLEAN DEFAULT false,
  emailAddress VARCHAR(255),
  smsEnabled BOOLEAN DEFAULT false,
  phoneNumber VARCHAR(20),
  tempHighThreshold DECIMAL(4,1),
  tempLowThreshold DECIMAL(4,1),
  rhHighThreshold DECIMAL(4,1),
  rhLowThreshold DECIMAL(4,1),
  ppfdLowThreshold INT,
  phHighThreshold DECIMAL(3,1),
  phLowThreshold DECIMAL(3,1),
  ecHighThreshold DECIMAL(4,2),
  ecLowThreshold DECIMAL(4,2),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tentId) REFERENCES tents(id),
  UNIQUE KEY unique_tent (tentId)
);
```

3. Aguarde a confirmação de sucesso

### Opção B: Via Linha de Comando (Avançado)

Se preferir, você pode usar o Drizzle Kit:

```bash
# No seu projeto local
npm run db:push
```

---

## Passo 5: Inserir Dados de Exemplo (Opcional)

Cole no Console do PlanetScale:

```sql
-- Inserir estufas de exemplo
INSERT INTO tents (name, tentType, width, depth, height, volume, powerW) VALUES
('Estufa A', 'INDOOR', 1.20, 1.20, 2.00, 2.88, 600),
('Estufa B', 'INDOOR', 0.80, 0.80, 1.60, 1.02, 300),
('Estufa C', 'GREENHOUSE', 2.00, 1.50, 2.50, 7.50, 1000);

-- Inserir strain de exemplo
INSERT INTO strains (name, type, vegaDays, floraDays, notes) VALUES
('OG Kush', 'HYBRID', 28, 56, 'Strain clássica, resistente e produtiva');

-- Inserir ciclo ativo de exemplo
INSERT INTO cycles (tentId, strainId, startDate, floraStartDate, status) VALUES
(2, 1, DATE_SUB(CURDATE(), INTERVAL 14 DAYS), NULL, 'ACTIVE');
```

---

## Passo 6: Configurar no Projeto

1. Abra o arquivo `.env` do seu projeto
2. Substitua a linha `DATABASE_URL` pela connection string do PlanetScale:

```env
DATABASE_URL='mysql://xxxxxxxxx:************@aws.connect.psdb.cloud/cultivo-app?sslaccept=strict'
```

3. Salve o arquivo

---

## Passo 7: Testar Conexão

```bash
# No terminal, dentro da pasta do projeto
npm run dev
```

Se aparecer "Server running on http://localhost:3000" sem erros, está funcionando! 🎉

---

## 🔒 Segurança

⚠️ **NUNCA compartilhe sua DATABASE_URL publicamente!**

- Não commite o arquivo `.env` no GitHub
- Use variáveis de ambiente no Vercel (próximo guia)
- Se a senha vazar, delete a password no PlanetScale e crie uma nova

---

## 📊 Monitoramento

No dashboard do PlanetScale você pode ver:
- **Insights:** Queries mais lentas
- **Branches:** Versões do banco (como Git)
- **Backups:** Restaurar dados antigos
- **Usage:** Quanto você está usando do plano gratuito

---

## ❓ Problemas Comuns

### Erro: "Access denied"
- Verifique se copiou a connection string completa
- Certifique-se que incluiu `?sslaccept=strict` no final

### Erro: "Table doesn't exist"
- Rode o SQL do Passo 4 novamente no Console

### Erro: "Too many connections"
- No plano gratuito, limite de 1000 conexões simultâneas
- Reinicie o servidor: `npm run dev`

---

## 🎯 Próximo Passo

Agora que o banco está configurado, vamos configurar o **Vercel** para hospedar o site!

➡️ Veja o arquivo: `GUIA-VERCEL.md`
