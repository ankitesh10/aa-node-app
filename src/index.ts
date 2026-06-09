import app from "./server.ts";

import { drizzle } from "drizzle-orm/neon-http";

export const db = drizzle(process.env.DATABASE_URL);

const port = 3000;

app.listen(port, () => {
  console.log(`hello from localhost:${port}`);
});
