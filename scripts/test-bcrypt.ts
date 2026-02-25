import * as bcrypt from "bcryptjs";
console.log("type:", typeof bcrypt);
console.log("hash:", typeof bcrypt.hash);
console.log("hashSync:", typeof bcrypt.hashSync);

const hash = bcrypt.hashSync("teste123", 10);
console.log("hash result:", hash.substring(0, 20) + "...");
console.log("verify:", bcrypt.compareSync("teste123", hash));
