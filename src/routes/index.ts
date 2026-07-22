import { Router } from "express";
import botRouter from "./bot.ts";
import chatSessionRouter from "./chat-session.ts";
import healthRouter from "./health.ts";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "hello" });
});

router.use(botRouter);
router.use(healthRouter);
router.use(chatSessionRouter);

export default router;
