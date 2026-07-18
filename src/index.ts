import "dotenv/config";
import app from "./server.ts";
import { initializeTelemetry } from "./observability/telemetry.ts";

const port = process.env.APP_PORT;

initializeTelemetry();

app.listen(port, () => {
  console.log(`hello from localhost:${port}`);
});
