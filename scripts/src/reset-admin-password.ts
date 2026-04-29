import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@41tech.com.br";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

(async () => {
  if (!ADMIN_PASSWORD) {
    console.error("Erro: defina a variável ADMIN_PASSWORD antes de rodar este script.");
    console.error("Exemplo: ADMIN_PASSWORD=SuaSenha pnpm --filter @workspace/scripts run admin:reset-password");
    process.exit(1);
  }

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, ADMIN_EMAIL))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(usersTable).values({
      email: ADMIN_EMAIL,
      passwordHash: hash,
      name: "Admin",
      role: "admin",
    });
  } else {
    await db
      .update(usersTable)
      .set({ passwordHash: hash })
      .where(eq(usersTable.email, ADMIN_EMAIL));
  }

  console.log("Senha admin atualizada com sucesso.");
  process.exit(0);
})();
