# 🚀 App Cultivo - Guia Rápido (5 minutos)

## 📦 Instalação

```bash
# 1. Extraia o ZIP do App Cultivo
# 2. Abra o terminal na pasta extraída
# 3. Execute o setup
./setup-local.sh

# 4. Inicie o app
pnpm dev

# 5. Acesse no navegador
# http://localhost:3000
```

## 🗄️ Importar Banco Inicial

```bash
# SQLite (padrão)
sqlite3 local.db < banco-inicial.sql

# MySQL (opcional)
mysql -u usuario -p cultivo < banco-inicial.sql
```

## 🎯 Primeiros Passos

### 1. Visualizar Estufas

A página inicial já mostra **3 estufas** pré-configuradas:
- **Estufa A:** Manutenção (Semana 2)
- **Estufa B:** Vegetativa (Semana 5)
- **Estufa C:** Floração (Semana 1)

### 2. Registrar Parâmetros

1. Clique em **"Registrar"** em qualquer estufa
2. Escolha turno: **AM** ou **PM**
3. Preencha:
   - Temperatura (°C)
   - Umidade (%)
   - PPFD (μmol/m²/s)
4. Salve

### 3. Marcar Tarefas

- Cada estufa tem **tarefas da semana**
- Marque ✅ conforme completa
- Progresso aparece no card (ex: 2/5)

### 4. Usar Calculadoras

Acesse **"Calculadoras"** no menu:
- **Lux ↔ PPFD:** Converta leituras de luxímetro
- **PPM ↔ EC:** Converta condutividade elétrica
- **pH:** Calcule ajuste de pH
- **Fertilização:** Dose micronutrientes (Ca, Mg, Fe)

### 5. Ver Histórico

Acesse **"Histórico"** para ver todos os registros em tabela.

## ⚙️ Configurações Importantes

### Ativar Modo Escuro (Recomendado)

1. Acesse **"Configurações"**
2. Toggle **"Modo Escuro"**

### Criar Nova Estufa

1. Página inicial → **"Criar Nova Estufa"**
2. Preencha nome, tipo, dimensões
3. Escolha **fase inicial**
4. Salve

## 📊 Fluxo de Trabalho Diário

```
1. Abrir app (http://localhost:3000)
2. Registrar parâmetros (AM e PM)
3. Marcar tarefas completadas
4. Verificar alertas (se houver)
5. Usar calculadoras conforme necessário
```

## 🆘 Problemas Comuns

**Servidor não inicia:**
```bash
# Mude a porta no .env
PORT=3001
```

**Dados não aparecem:**
```bash
# Reimporte o banco
sqlite3 local.db < banco-inicial.sql
```

**Página em branco:**
```bash
# Limpe cache do navegador
Ctrl+Shift+Delete → Limpar tudo
```

## 📖 Documentação Completa

Para guia detalhado, veja **GUIA-COMPLETO.md**

---

**Pronto para cultivar! 🌱**
