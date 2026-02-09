# 🍎 Instalação no macOS - App Cultivo

## ⚠️ Problema Identificado: pnpm vs npm

Após extensa investigação, descobrimos que o **pnpm bloqueia build scripts** por padrão no macOS, impedindo a compilação do `better-sqlite3`. Nenhuma configuração (`.npmrc`, `--ignore-scripts=false`, etc.) consegue sobrescrever essa proteção.

## ✅ Solução: Use NPM

A versão antiga do app funcionava porque usava **npm** ao invés de pnpm. O npm não tem esse sistema de bloqueio.

## 📦 Instalação Recomendada

### Opção 1: Instalador NPM (Recomendado para Mac)

```bash
bash install-npm.sh
```

Este script:
- ✅ Usa `npm install --legacy-peer-deps` (sem bloqueio de build scripts)
- ✅ Compila better-sqlite3 automaticamente
- ✅ Cria banco de dados SQLite com dados de exemplo
- ✅ Configura ambiente de desenvolvimento

### Opção 2: Instalador PNPM (Pode falhar no Mac)

```bash
bash install.sh
```

Este script tenta múltiplas estratégias:
1. Criar `.npmrc` para forçar build scripts
2. Baixar bindings pré-compilados do GitHub
3. Compilar manualmente com `npm run build-release`

⚠️ **Aviso:** Pode falhar se você não tiver Xcode Command Line Tools instalados.

## 🔧 Requisitos

### Obrigatórios
- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** (vem com Node.js)

### Opcionais (para compilação manual)
- **Xcode Command Line Tools** (apenas se install-npm.sh falhar)
  ```bash
  xcode-select --install
  ```

## 🚀 Início Rápido

```bash
# 1. Extrair o pacote
unzip app-cultivo-deploy-v3.0.0-NPM-FINAL.zip
cd cultivo-architecture-docs

# 2. Instalar (use NPM no Mac!)
bash install-npm.sh

# 3. Iniciar servidor
npm run dev

# 4. Abrir no navegador
# http://localhost:3000
```

## 📊 Banco de Dados

O instalador cria automaticamente:
- ✅ Arquivo `local.db` (SQLite)
- ✅ Tabelas: tents, cycles, strains, dailyLogs, weeklyTargets, users
- ✅ 29 registros de exemplo para testar gráficos

## 🐛 Solução de Problemas

### Erro: "Could not locate the bindings file"

**Causa:** better-sqlite3 não foi compilado

**Solução:**
```bash
# Instalar Xcode Command Line Tools
xcode-select --install

# Recompilar better-sqlite3
cd node_modules/better-sqlite3
npm run install
cd ../..

# Tentar novamente
npm run dev
```

### Erro: "pnpm WARN Ignored build scripts"

**Causa:** Você está usando pnpm que bloqueia build scripts

**Solução:** Use o instalador NPM
```bash
# Remover node_modules instalado com pnpm
rm -rf node_modules

# Instalar com npm
bash install-npm.sh
```

### Erro: "EACCES: permission denied"

**Causa:** Permissões de arquivo

**Solução:**
```bash
# Dar permissão de execução aos scripts
chmod +x install-npm.sh
chmod +x install.sh

# Rodar novamente
bash install-npm.sh
```

## 📝 Scripts Disponíveis

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

# Popular banco com dados de exemplo
npm run seed
```

## 🔄 Diferenças: npm vs pnpm

| Aspecto | npm | pnpm |
|---------|-----|------|
| **Build Scripts** | ✅ Roda automaticamente | ❌ Bloqueia por padrão |
| **Velocidade** | Mais lento | Mais rápido |
| **Espaço em disco** | Mais espaço | Menos espaço (hardlinks) |
| **Compatibilidade Mac** | ✅ Funciona sempre | ⚠️ Requer configuração |
| **Recomendação** | **Use no Mac** | Use no Linux/CI |

## 📚 Estrutura do Projeto

```
cultivo-architecture-docs/
├── client/              # Frontend React
│   ├── src/
│   │   ├── pages/      # Páginas do app
│   │   └── components/ # Componentes reutilizáveis
├── server/             # Backend Express + tRPC
│   ├── _core/          # Infraestrutura
│   └── routers.ts      # Endpoints da API
├── drizzle/            # Schema do banco de dados
├── shared/             # Código compartilhado
├── local.db            # Banco SQLite (criado na instalação)
├── .env                # Variáveis de ambiente
├── install-npm.sh      # ✅ Instalador recomendado para Mac
└── install.sh          # Instalador alternativo (pnpm)
```

## 🆘 Suporte

Se continuar com problemas:

1. **Verifique os requisitos:**
   ```bash
   node -v    # Deve ser 18+
   npm -v     # Deve existir
   ```

2. **Limpe instalação anterior:**
   ```bash
   rm -rf node_modules package-lock.json pnpm-lock.yaml
   bash install-npm.sh
   ```

3. **Verifique logs de erro:**
   ```bash
   npm run dev 2>&1 | tee error.log
   ```

## 📖 Documentação Adicional

- `QUICK-START.md` - Guia rápido de uso
- `DEPLOY_GUIDE.md` - Deploy em produção
- `ENV_VARS.md` - Variáveis de ambiente
- `MIGRATION.md` - Migrações de banco de dados

---

**Versão:** 3.0.0  
**Data:** Fevereiro 2026  
**Testado em:** macOS Sonoma (Apple Silicon M1/M2)
