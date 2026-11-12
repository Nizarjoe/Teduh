import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getEnv } from "@/lib/env";
import { AppError } from "@/lib/errors";

const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type ImageType = keyof typeof extensions;

export function sniffImage(bytes: Buffer): ImageType | null {
  const b0 = bytes[0];
  const b1 = bytes[1];
  const b2 = bytes[2];
  if (b0 === 0xff && b1 === 0xd8 && b2 === 0xff) return "image/jpeg";
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(png)) return "image/png";
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP") {
    return "image/webp";
  }
  return null;
}

function s3Client(): S3Client | null {
  const env = getEnv();
  if (!env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY || !env.S3_PUBLIC_URL) return null;
  return new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: Boolean(env.S3_ENDPOINT),
  });
}

export async function saveImage(bytes: Buffer, folder: string): Promise<string> {
  if (bytes.length > 2_000_000) throw new AppError("upload", "Gambar maksimal 2 MB.", 400);
  const type = sniffImage(bytes);
  if (!type) throw new AppError("upload", "Hanya JPEG, PNG, atau WebP.", 400);
  const safeFolder = folder.replace(/[^a-z0-9/-]/gi, "");
  const key = `${safeFolder}/${randomUUID()}.${extensions[type]}`;
  const client = s3Client();
  if (client) {
    const env = getEnv();
    await client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: bytes,
        ContentType: type,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return `${env.S3_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
  }
  const root = path.resolve(process.cwd(), "storage/uploads");
  const full = path.resolve(root, key);
  const relative = path.relative(root, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new AppError("upload", "Path tidak valid.", 400);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, bytes);
  return `/media/${key}`;
}

export async function readLocalUpload(key: string[]): Promise<{ bytes: Buffer; type: string } | null> {
  const rel = key.join("/");
  if (!rel || rel.includes("..")) return null;
  const root = path.resolve(process.cwd(), "storage/uploads");
  const full = path.resolve(root, rel);
  const relative = path.relative(root, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  try {
    const bytes = await readFile(full);
    const ext = path.extname(full).toLowerCase();
    const type = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return { bytes, type };
  } catch {
    return null;
  }
}
