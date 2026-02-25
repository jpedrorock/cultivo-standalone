import { hashPassword, verifyPassword } from "../server/_core/bcryptWrapper.js";

async function main() {
  const h = await hashPassword("teste123");
  console.log("Hash OK:", h.substring(0, 20) + "...");
  const ok = await verifyPassword("teste123", h);
  console.log("Verify OK:", ok);
}

main().catch(console.error);
