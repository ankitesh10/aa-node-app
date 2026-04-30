import app from "./server.ts";

const port = 3000;

app.listen(port, () => {
  console.log(`hello from localhost:${port}`);
});
