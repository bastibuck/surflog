import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: "./.env.local" });

export default defineConfig({
  out: "./src/plugins/database/drizzle",
  schema: ["./src/modules/**/*.model.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ["public"],
});
