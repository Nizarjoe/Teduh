import { desc, eq } from "drizzle-orm";
import { ReviewModeration } from "@/components/admin/review-moderation";
import { getDb } from "@/db/client";
import { products, reviews } from "@/db/schema";

export default async function ReviewsPage() {
  const rows = await getDb()
    .select({
      id: reviews.id,
      authorName: reviews.authorName,
      city: reviews.city,
      rating: reviews.rating,
      body: reviews.body,
      status: reviews.status,
      productName: products.name,
    })
    .from(reviews)
    .innerJoin(products, eq(products.id, reviews.productId))
    .orderBy(desc(reviews.createdAt))
    .limit(100);
  const pending = rows.filter((row) => row.status === "pending");
  const rest = rows.filter((row) => row.status !== "pending");
  return (
    <div>
      <h1 className="font-serif text-4xl">Ulasan</h1>
      <ReviewModeration reviews={[...pending, ...rest]} />
    </div>
  );
}
