# 📦 App Cultivo - Pacote de Deploy

Este é o pacote completo para instalação do App Cultivo em seu próprio servidor.

## 📋 O que está incluído

- ✅ Código-fonte completo (frontend + backend)
- ✅ Schema do banco de dados (Drizzle ORM)
- ✅ Script de instalação automatizado (`setup.sh`)
- ✅ Documentação completa de instalação (`INSTALACAO.md`)
- ✅ Guia de deploy (`DEPLOY.md`)
- ✅ Configurações de exemplo

## 🚀 Instalação Rápida

### Opção 1: Script Automatizado (Recomendado)

```bash
# 1. Extrair pacote
unzip app-cultivo-deploy.zip
cd cultivo-architecture-docs

# 2. Executar script de instalação
./setup.sh
```

O script irá:
- ✓ Verificar dependências (Node.js, pnpm, MySQL)
- ✓ Criar arquivo .env interativamente
- ✓ Instalar dependências npm
- ✓ Criar banco de dados (se necessário)
- ✓ Aplicar migrations
- ✓ Compilar aplicação
- ✓ Iniciar servidor (opcional)

### Opção 2: Instalação Manual

```bash
# 1. Extrair pacote
unzip app-cultivo-deploy.zip
cd cultivo-architecture-docs

# 2. Instalar dependências
pnpm install

# 3. Configurar ambiente
cp .env.example .env
nano .env  # Editar com suas configurações

# 4. Criar banco de dados
mysql -u root -p
CREATE DATABASE cultivo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 5. Aplicar migrations
pnpm db:push

# 6. Compilar e iniciar
pnpm build
NODE_ENV=production node dist/_core/index.js
```

## 📚 Documentação Completa

- **[INSTALACAO.md](./INSTALACAO.md)** - Guia detalhado de instalação passo a passo
- **[DEPLOY.md](./DEPLOY.md)** - Opções de deploy (Manus, Vercel, Railway, servidor próprio)
- **[README.md](./README.md)** - Documentação do projeto
- **[GUIA-USUARIO.md](./GUIA-USUARIO.md)** - Manual do usuário

## 🔧 Requisitos Mínimos

- **Node.js**: 22.x ou superior
- **pnpm**: Instalado globalmente
- **MySQL**: 8.0 ou superior
- **RAM**: 4GB
- **Disco**: 20GB livres

## 🌐 Acesso

Após instalação bem-sucedida, acesse:

```
http://localhost:3000
```

Para produção, configure Nginx como proxy reverso e SSL com Certbot.

## 🔒 Segurança

⚠️ **IMPORTANTE**: Antes de colocar em produção:

1. Gere um `JWT_SECRET` forte (32+ caracteres aleatórios)
2. Use senhas fortes para MySQL
3. Configure HTTPS (SSL/TLS)
4. Configure firewall (apenas portas 80, 443, 22)
5. Ative backup automático do banco de dados

## 📞 Suporte

- **Documentação**: Consulte os arquivos `.md` incluídos
- **Issues**: Reporte problemas no repositório GitHub
- **Email**: contato@exemplo.com

## 📄 Licença

Este software é proprietário. Todos os direitos reservados.

---

**Desenvolvido com 🌱 para cultivadores**
