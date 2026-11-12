"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="id">
      <body style={{ fontFamily: "Georgia, serif", background: "#F3F0E8", color: "#17211E", padding: "4rem 1.25rem" }}>
        <h1>Teduh sedang kesulitan.</h1>
        <button type="button" onClick={reset} style={{ marginTop: "1rem" }}>Coba lagi</button>
      </body>
    </html>
  );
}
