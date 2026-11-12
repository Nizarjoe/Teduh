import { config } from "dotenv";

config();

async function main(): Promise<void> {
  const { isNotNull } = await import("drizzle-orm");
  const { getDb } = await import("../src/db/client");
  const { reviews } = await import("../src/db/schema");
  const removed = await getDb().delete(reviews).where(isNotNull(reviews.seedKey)).returning({ id: reviews.id });
  console.log(`menghapus ${removed.length} ulasan contoh`);
}

void main();
