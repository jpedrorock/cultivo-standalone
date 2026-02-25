# Guia de Migração: Manus → Standalone

Este documento detalha todas as mudanças necessárias para migrar do App Cultivo com Manus para a versão Standalone.

## 1. Dependências Removidas

### Manus OAuth
- **Arquivo:** `server/_core/oauth.ts`
- **Arquivo:** `server/_core/sdk.ts`
- **Arquivo:** `server/_core/cookies.ts`
- **Razão:** Substituído por Lucia Auth (open-source)

### Manus CDN
- **Arquivo:** `server/storage.ts` (modificado)
- **CLI:** `manus-upload-file`
- **Razão:** Substituído por armazenamento local

### Vite Plugin Manus
- **Dependência:** `vite-plugin-manus-runtime`
- **Razão:** Não necessário para aplicação standalone

### AWS SDK (Opcional)
- **Dependências:** `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`
- **Razão:** Não utilizado no armazenamento local

## 2. Dependências Adicionadas

```json
{
  "lucia": "^3.0.0",
  "@lucia-auth/adapter-drizzle": "^1.0.0",
  "argon2": "^0.31.2",
  "bcryptjs": "^2.4.3"
}
```

### Lucia Auth
- Biblioteca de autenticação moderna e segura
- Suporte nativo ao Drizzle ORM
- Gerenciamento de sessão com cookies seguros

### Argon2 / Bcryptjs
- Hash seguro de senhas
- Argon2 é mais moderno, bcryptjs é mais compatível

## 3. Mudanças no Banco de Dados

### Novo Schema para Sessões

O Lucia Auth requer uma tabela de sessões. A migração será criada automaticamente com:

```sql
CREATE TABLE sessions (
  id TEXT NOT NULL PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Campos Adicionais na Tabela Users

```sql
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
```

## 4. Mudanças no Código

### Antes: Autenticação com Manus

```typescript
// server/_core/oauth.ts
export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    
    const tokenResponse = await sdk.exchangeCodeForToken(code, state);
    const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
    
    // Criar sessão Manus
    const sessionToken = await sdk.createSessionToken(userInfo.openId, {
      name: userInfo.name || "",
      expiresInMs: ONE_YEAR_MS,
    });
    
    res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
    res.redirect(302, "/");
  });
}
```

### Depois: Autenticação com Lucia

```typescript
// server/auth.ts
import { Lucia } from "lucia";
import { DrizzleAdapter } from "@lucia-auth/adapter-drizzle";

const adapter = new DrizzleAdapter(drizzleDb, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    },
  },
});
```

### Rotas de Autenticação (Nova Implementação)

```typescript
// server/auth-routes.ts
import { lucia } from "./auth";
import { hash } from "argon2";
import { verify } from "argon2";

app.post("/api/auth/register", async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  
  // Hash da senha
  const passwordHash = await hash(password);
  
  // Criar usuário
  const user = await db.createUser({
    email,
    name,
    passwordHash,
    openId: generateOpenId(),
  });
  
  // Criar sessão
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  
  res.setHeader("Set-Cookie", sessionCookie.serialize());
  res.redirect(302, "/");
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  const user = await db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  // Verificar senha
  const validPassword = await verify(user.passwordHash, password);
  if (!validPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  
  // Criar sessão
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  
  res.setHeader("Set-Cookie", sessionCookie.serialize());
  res.redirect(302, "/");
});
```

### Antes: Storage com Manus CDN

```typescript
// server/storage.ts (Manus)
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  // Upload para Manus CDN via CLI
  const { stdout } = await execFileAsync('manus-upload-file', [tmpFilePath]);
  const cdnUrlMatch = stdout.match(/CDN URL:\s*(https:\/\/[^\s]+)/);
  const url = cdnUrlMatch[1].trim();
  
  return { key: normalizedKey, url };
}
```

### Depois: Storage Local

```typescript
// server/storageLocal.ts
export async function storageLocalPut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  ensureUploadsDirExists();
  
  const key = relKey.replace(/^\/+/, "");
  const filePath = path.join(UPLOADS_DIR, key);
  
  // Criar diretórios intermediários
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Salvar arquivo
  let buffer: Buffer;
  if (typeof data === 'string') {
    buffer = Buffer.from(data);
  } else if (data instanceof Uint8Array) {
    buffer = Buffer.from(data);
  } else {
    buffer = data;
  }
  
  fs.writeFileSync(filePath, buffer);
  
  const url = `/uploads/${key}`;
  return { key, url };
}
```

## 5. Contexto tRPC

### Antes

```typescript
// server/_core/context.ts
export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  
  return { req: opts.req, res: opts.res, user };
}
```

### Depois

```typescript
// server/_core/context.ts
import { lucia } from "../auth";

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  
  try {
    const sessionId = lucia.readSessionCookie(opts.req.headers.cookie ?? "");
    if (sessionId) {
      const session = await lucia.validateSession(sessionId);
      if (session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        opts.res.setHeader("Set-Cookie", sessionCookie.serialize());
      }
      user = session.user;
    }
  } catch (error) {
    user = null;
  }
  
  return { req: opts.req, res: opts.res, user };
}
```

## 6. Configuração do Servidor

### Antes

```typescript
// server/_core/index.ts
import { registerOAuthRoutes } from "./oauth";

const app = express();
registerOAuthRoutes(app);
```

### Depois

```typescript
// server/_core/index.ts
import authRoutes from "../auth-routes";

const app = express();

// Servir arquivos estáticos de uploads
app.use('/uploads', express.static('uploads'));

// Registrar rotas de autenticação
app.use('/api/auth', authRoutes);

// Resto da configuração...
```

## 7. Variáveis de Ambiente

### Antes (Manus)

```env
OAUTH_SERVER_URL=https://manus-oauth.example.com
APP_ID=seu-app-id-manus
MANUS_API_KEY=sua-chave-manus
```

### Depois (Standalone)

```env
DATABASE_URL=mysql://usuario:senha@localhost:3306/cultivo
SESSION_SECRET=sua-chave-secreta-segura
PORT=3000
NODE_ENV=development
```

## 8. Processo de Build

### Antes

```json
{
  "build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "devDependencies": {
    "vite-plugin-manus-runtime": "^0.0.57"
  }
}
```

### Depois

```json
{
  "build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
}
```

O plugin Manus foi removido do `vite.config.ts`.

## 9. Checklist de Migração

- [ ] Remover arquivos Manus (`oauth.ts`, `sdk.ts`, `cookies.ts`)
- [ ] Instalar novas dependências (`lucia`, `argon2`, `@lucia-auth/adapter-drizzle`)
- [ ] Criar arquivo `server/auth.ts`
- [ ] Atualizar `server/_core/context.ts`
- [ ] Criar rotas de autenticação
- [ ] Atualizar `server/_core/index.ts`
- [ ] Remover plugin Vite Manus
- [ ] Remover dependências AWS SDK (opcional)
- [ ] Executar migrações do banco de dados
- [ ] Testar autenticação (registro, login, logout)
- [ ] Testar upload de fotos
- [ ] Testar build para produção
- [ ] Configurar variáveis de ambiente
- [ ] Deploy em servidor de teste

## 10. Troubleshooting

### Erro: "manus-upload-file not found"

**Solução:** O comando `manus-upload-file` não existe na versão standalone. Use `storageLocalPut` ao invés disso.

### Erro: "SESSION_SECRET not configured"

**Solução:** Configure a variável `SESSION_SECRET` no arquivo `.env`:
```bash
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### Erro: "Database connection failed"

**Solução:** Verifique se o MySQL está rodando e se a `DATABASE_URL` está correta:
```bash
mysql -u usuario -p -e "SELECT 1;"
```

### Erro: "Cannot find module 'lucia'"

**Solução:** Instale as dependências novamente:
```bash
pnpm install
```

## 11. Próximos Passos

1. **Teste completo:** Execute `pnpm test` para garantir que tudo funciona
2. **Build:** Execute `pnpm build` para criar a versão de produção
3. **Deploy:** Siga as instruções no `README-STANDALONE.md`
4. **Monitoramento:** Configure logs e monitoramento para produção

## Suporte

Para dúvidas ou problemas durante a migração, consulte:

- Documentação do Lucia: https://lucia-auth.com
- Documentação do Drizzle: https://orm.drizzle.team
- Issues do projeto: https://github.com/jpedrorock/cultivo-standalone/issues
