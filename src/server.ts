import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.ts";

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(routes);

export default app;
