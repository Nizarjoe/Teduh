import type { NextConfig } from "next";

const s3Host = (() => {
  const raw = process.env.S3_PUBLIC_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
})();

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com https://www.googletagmanager.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://app.sandbox.midtrans.com https://app.midtrans.com https://api.sandbox.midtrans.com https://api.midtrans.com https://www.google-analytics.com https://region1.google-analytics.com https://www.facebook.com https://connect.facebook.net",
  "frame-src https://app.sandbox.midtrans.com https://app.midtrans.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["pg", "ioredis", "@aws-sdk/client-s3"],
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: s3Host ? [{ protocol: "https", hostname: s3Host }] : [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
