import { formatIDR } from "@/lib/money";

export function Price({
  amount,
  compare,
  size = "md",
}: {
  amount: number;
  compare?: number | null;
  size?: "md" | "lg";
}) {
  return (
    <p className={size === "lg" ? "text-xl" : "text-base"}>
      <span className="font-medium tabular-nums text-ink">{formatIDR(amount)}</span>
      {compare && compare > amount ? (
        <s className="ml-2 text-sm font-normal text-ink-soft">
          <span className="sr-only">Harga pembanding </span>
          {formatIDR(compare)}
        </s>
      ) : null}
    </p>
  );
}
