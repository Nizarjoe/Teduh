import { config } from "dotenv";

config();

async function main(): Promise<void> {
  const { migrate } = await import("../src/db/migrate");
  await migrate();
}

void main();
