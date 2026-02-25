# Instruções para Push no GitHub

## Passo 1: Criar um novo repositório no GitHub

1. Acesse https://github.com/new
2. Preencha os dados:
   - **Repository name:** `cultivo-standalone` (ou o nome que preferir)
   - **Description:** App Cultivo - Versão Standalone (sem dependências Manus)
   - **Public/Private:** Escolha conforme preferir
   - **NÃO** inicialize com README, .gitignore ou LICENSE (já temos)

3. Clique em "Create repository"

## Passo 2: Adicionar remote e fazer push

Após criar o repositório, você verá instruções. Execute estes comandos:

```bash
# Navegue até a pasta do projeto
cd /home/ubuntu/cultivo-standalone

# Adicione o remote do GitHub
git remote add origin https://github.com/seu-usuario/cultivo-standalone.git

# Renomeie a branch para main (se necessário)
git branch -M main

# Faça o push
git push -u origin main
```

## Passo 3: Verificar o repositório

Acesse `https://github.com/seu-usuario/cultivo-standalone` para verificar se tudo foi enviado corretamente.

## Arquivos Inclusos

O repositório contém:

✅ **Código-fonte completo** do App Cultivo
✅ **Documentação:**
  - README-STANDALONE.md (guia principal)
  - MIGRATION-GUIDE.md (guia de migração)
  - DEPENDENCIES.md (análise de dependências)
  - .env.example (configuração)

✅ **Código de autenticação:**
  - server/auth.ts (Lucia Auth)
  - server/storageLocal.ts (storage local)

✅ **Configuração:**
  - package.json (atualizado)
  - .gitignore-standalone
  - uploads/ (diretório para fotos)

## Próximos Passos

1. **Clone em outro lugar** para testar:
   ```bash
   git clone https://github.com/seu-usuario/cultivo-standalone.git cultivo-teste
   cd cultivo-teste
   pnpm install
   pnpm dev
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite .env com suas credenciais
   ```

3. **Execute as migrações:**
   ```bash
   pnpm db:push
   ```

4. **Inicie o servidor:**
   ```bash
   pnpm dev
   ```

## Dúvidas?

Consulte:
- README-STANDALONE.md - Guia completo
- MIGRATION-GUIDE.md - Como migrar do Manus
- DEPENDENCIES.md - Análise de dependências

---

**Pronto para deploy em qualquer servidor! 🌱**
