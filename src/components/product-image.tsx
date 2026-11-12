import Image from "next/image";

export function ProductImage({
  src,
  alt,
  priority = false,
  sizes,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
}) {
  if (src.startsWith("/products/")) {
    return (
      <Image
        src={src}
        alt={alt}
        width={800}
        height={1000}
        priority={priority}
        sizes={sizes}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    // Unggahan runtime dan URL penyimpanan tidak selalu lewat pengoptimal statis.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={800} height={1000} className="h-full w-full object-cover" />
  );
}
