import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#F3F0E8", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 72 }}>
        <div style={{ fontSize: 28, letterSpacing: 4, color: "#1F4D45" }}>JAS HUJAN</div>
        <div style={{ fontSize: 92, color: "#17211E", marginTop: 12 }}>Teduh</div>
        <div style={{ fontSize: 32, color: "#3C4A45", marginTop: 16 }}>Kering sampai rumah.</div>
      </div>
    ),
    size,
  );
}
