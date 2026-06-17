import "dotenv/config";
import app from "./server.ts";

const port = 3001;

app.listen(port, () => {
  console.log(`hello from localhost:${port}`);
});
