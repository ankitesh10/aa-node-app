import "dotenv/config";
import app from "./server.ts";

const port = 8081;

app.listen(port, () => {
  console.log(`hello from localhost:${port}`);
});
