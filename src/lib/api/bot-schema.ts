import z from "zod";

const messagePartSchema = z.looseObject({
  type: z.string().trim().min(1, "Part type is required"),
});

const messageSchema = z.looseObject({
  id: z.string().trim().min(1, "Message ID is required"),
  role: z.enum(["system", "user", "assistant"]),
  parts: z.array(messagePartSchema).min(1, "Message parts cannot be empty"),
});

export const botRequestSchema = z.looseObject({
  sessionId: z
    .string()
    .trim()
    .min(1, "Session ID is required")
    .max(191, "Session ID is too long"),
  messages: z.array(messageSchema).min(1, "Messages cannot be empty"),
});
