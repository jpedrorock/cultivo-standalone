/**
 * Wrapper para bcryptjs compatível com ESM.
 * O bcryptjs é um módulo CJS sem exports field, então precisa ser importado via createRequire.
 */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const bcryptjs = require("bcryptjs");

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export function hashPasswordSync(password: string): string {
  return bcryptjs.hashSync(password, 12);
}
