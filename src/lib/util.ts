import { customAlphabet } from "nanoid";

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789");

const MIN_CHUNK_LENGTH = 40;

const normalizeWhitespace = (value: string) =>
  value.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();

export function generateChunks(input: string): string[] {
  return normalizeWhitespace(input)
    .split(/\n{2,}/)
    .map((section) => section.trim())
    .filter((chunk) => chunk.length >= MIN_CHUNK_LENGTH);
}
