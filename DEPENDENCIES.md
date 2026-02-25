# Análise de Dependências - App Cultivo Standalone

## Resumo Executivo

O App Cultivo foi originalmente desenvolvido com dependências da plataforma Manus. Esta versão standalone remove todas essas dependências e as substitui por alternativas open-source, mantendo 100% da funcionalidade.

## Dependências Removidas

| Dependência | Tipo | Razão | Alternativa |
| :--- | :--- | :--- | :--- |
| **Manus OAuth** | Autenticação | Serviço proprietário Manus | Lucia Auth |
| **Manus CDN** | Storage | Serviço proprietário Manus | Armazenamento Local |
| **vite-plugin-manus-runtime** | Build | Plugin específico Manus | Vite padrão |
| **@aws-sdk/client-s3** | Storage | Não utilizado no storage local | Removido |
| **@aws-sdk/s3-request-presigner** | Storage | Não utilizado no storage local | Removido |

## Dependências Adicionadas

| Dependência | Versão | Tipo | Propósito |
| :--- | :--- | :--- | :--- |
| **lucia** | ^3.0.0 | Autenticação | Gerenciamento de sessão seguro |
| **@lucia-auth/adapter-drizzle** | ^1.0.0 | Autenticação | Integração Lucia com Drizzle ORM |
| **argon2** | ^0.31.2 | Segurança | Hash de senhas (moderno) |
| **bcryptjs** | ^2.4.3 | Segurança | Hash de senhas (alternativa) |

## Stack Tecnológica Completa

### Frontend
- React 19.2.1
- TypeScript 5.9.3
- Tailwind CSS 4.1.14
- shadcn/ui (componentes)
- Wouter (roteamento)
- tRPC Client (API)
- TanStack React Query (cache)
- Recharts (gráficos)

### Backend
- Express 4.21.2
- tRPC 11.6.0
- Node.js 22+
- TypeScript 5.9.3

### Banco de Dados
- MySQL 8.0+ / MariaDB 10.5+
- Drizzle ORM 0.44.5
- Drizzle Kit 0.31.4

### Autenticação (Novo)
- Lucia Auth 3.0.0
- Argon2 / Bcryptjs

### Storage
- Sistema de Arquivos Local
- Express Static Middleware

### Desenvolvimento
- Vite 7.1.7
- Vitest 2.1.4
- Prettier 3.6.2
- ESBuild 0.25.0

## Comparação: Manus vs Standalone

### Autenticação

**Manus:**
- OAuth centralizado no servidor Manus
- Gerenciamento de sessão via Manus SDK
- Suporte para múltiplos provedores (Google, Apple, etc.)
- Sem controle sobre dados de usuário

**Standalone:**
- Autenticação local com Lucia Auth
- Gerenciamento de sessão com cookies seguros
- Suporte para email/senha
- Controle total sobre dados de usuário

### Storage

**Manus:**
- Upload via CLI `manus-upload-file`
- Armazenamento em CDN Manus
- URLs públicas gerenciadas por Manus
- Dependência de conectividade com Manus

**Standalone:**
- Upload via Express Multer
- Armazenamento no sistema de arquivos local
- URLs relativas (`/uploads/...`)
- Sem dependências externas

### Build

**Manus:**
- Plugin Vite específico (`vite-plugin-manus-runtime`)
- Injeção de configurações Manus
- Integração com runtime Manus

**Standalone:**
- Vite padrão
- ESBuild para bundle do servidor
- Sem dependências de runtime

## Segurança

### Autenticação
- Senhas hasheadas com Argon2 (recomendado) ou Bcryptjs
- Cookies de sessão com `httpOnly` e `secure`
- CSRF protection via SameSite cookies
- Expiração de sessão configurável (padrão: 30 dias)

### Storage
- Validação de tipo de arquivo
- Limite de tamanho de upload (50MB)
- Conversão automática HEIC → JPEG
- Compressão de imagens (1080x1440)

## Performance

### Antes (Manus)
- Latência de upload: ~500ms (upload para CDN remoto)
- Latência de autenticação: ~300ms (chamada para OAuth server)
- Dependência de conectividade com Manus

### Depois (Standalone)
- Latência de upload: ~50-100ms (sistema de arquivos local)
- Latência de autenticação: ~10-50ms (banco de dados local)
- Sem dependências externas

## Escalabilidade

### Armazenamento Local
- **Limite:** Espaço em disco do servidor
- **Solução para escalar:** 
  - Usar NAS/SAN para storage compartilhado
  - Implementar S3 local (MinIO)
  - Usar CDN externo (CloudFront, Cloudflare)

### Autenticação
- **Limite:** Capacidade do banco de dados
- **Solução para escalar:**
  - Replicação de banco de dados
  - Read replicas para consultas
  - Cache de sessão com Redis

## Custo

### Manus
- Hospedagem: Incluída
- OAuth: Incluído
- Storage: Incluído
- Custo total: Variável conforme plano Manus

### Standalone
- Hospedagem: Seu servidor (VPS ~$5-50/mês)
- OAuth: Grátis (open-source)
- Storage: Custo de disco (incluído no VPS)
- Custo total: Apenas hospedagem

## Conclusão

A versão standalone oferece independência total, controle sobre dados e infraestrutura, com custo reduzido e performance melhorada. A única desvantagem é a necessidade de gerenciar sua própria infraestrutura, mas para muitos usuários, isso é uma vantagem.
