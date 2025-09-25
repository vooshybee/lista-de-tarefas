// generateHash.ts
import bcrypt from "bcrypt";

async function main() {
  const senha = "macarrao123";
  const hash = await bcrypt.hash(senha, 10); // gera hash
  console.log("Hash gerado:", hash);
}

main();
