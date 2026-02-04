import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { WilmaClient } from "../dist/index.js";

function loadEnvFile(path) {
  if (!existsSync(path)) {
    return;
  }
  const text = readFileSync(path, "utf-8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const idx = trimmed.indexOf("=");
    if (idx === -1) {
      continue;
    }
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const envPath = process.env.WILMA_ENV_PATH
  ? resolve(process.env.WILMA_ENV_PATH)
  : resolve(new URL("./.env.local", import.meta.url).pathname);

loadEnvFile(envPath);

const required = ["WILMA_BASE_URL", "WILMA_USERNAME", "WILMA_PASSWORD"]; // student id optional
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var ${key}. Provide it via .env.local or WILMA_ENV_PATH.`);
    process.exit(1);
  }
}

const profile = {
  baseUrl: process.env.WILMA_BASE_URL,
  username: process.env.WILMA_USERNAME,
  password: process.env.WILMA_PASSWORD,
  studentNumber: process.env.WILMA_STUDENT_ID ?? null,
};

const client = await WilmaClient.login(profile);

const messages = await client.messages.list("inbox");
const news = await client.news.list();
const exams = await client.exams.list();

console.log(`messages: ${messages.length}`);
console.log(`news: ${news.length}`);
console.log(`exams: ${exams.length}`);
