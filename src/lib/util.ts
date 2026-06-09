import { customAlphabet } from "nanoid";

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789");

export function generateChunks(input: string): string[] {
  return input
    .trim()
    .split(".")
    .filter((i) => i !== "");
}
