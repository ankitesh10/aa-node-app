import "dotenv/config";
import app from "./server.ts";

const port = process.env.APP_PORT;

app.listen(port, () => {
  console.log(`hello from localhost:${port}`);
});
