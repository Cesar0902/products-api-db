import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { createDatabase } from "./db.js";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });
const db = createDatabase();
const port = Number(process.env.PORT || 3000);

try {
  await db.execute("SELECT 1");
  const server = createApp({ db }).listen(port, () => {
    console.log(`Products app listening at http://localhost:${port}`);
  });
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => {
      server.close(async () => {
        await db.end();
        process.exit(0);
      });
    });
  }
} catch (error) {
  console.error("Unable to connect to MySQL:", error.code || error.message);
  await db.end();
  process.exitCode = 1;
}
