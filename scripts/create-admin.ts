/**
 * Script para criar usuário admin inicial
 * Uso: pnpm tsx scripts/create-admin.ts
 */
import "dotenv/config";
import * as db from "../server/db";
import * as bcrypt from "bcryptjs";

async function createAdmin() {
  const username = process.argv[2] || "admin";
  const password = process.argv[3] || "cultivo123";
  const name = process.argv[4] || "Administrador";

  console.log(`[CreateAdmin] Criando usuário: ${username}`);

  const existing = await db.getUserByOpenId(username);
  if (existing) {
    console.log(`[CreateAdmin] Usuário '${username}' já existe!`);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.upsertUser({
    openId: username,
    password: hashedPassword,
    name,
    loginMethod: "local",
    lastSignedIn: new Date(),
  });

  console.log(`[CreateAdmin] ✅ Usuário '${username}' criado com sucesso!`);
  console.log(`[CreateAdmin] Senha: ${password}`);
  process.exit(0);
}

createAdmin().catch((e) => {
  console.error("[CreateAdmin] Erro:", e.message);
  process.exit(1);
});
