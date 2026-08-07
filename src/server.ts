import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.ts";

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors(
    process.env.NODE_ENV === "production"
      ? { origin: "https://ankitesharora.com" }
      : undefined,
  ),
);
app.use(routes);
app.set("trust proxy", 1);

export default app;
