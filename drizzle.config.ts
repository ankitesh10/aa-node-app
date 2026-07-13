/// <reference types="node" />

import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  out: "./drizzle",
  schema: ["./src/db/schema/*.ts", "./src/db/enums/*.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true, // <-- more detailed CLI output
});
