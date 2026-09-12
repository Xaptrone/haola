import Image from "next/image";
import Link from "next/link";

export function BrandLogo({
  href = "/",
  className = "",
  height = 28,
}: {
  href?: string | null;
  className?: string;
  height?: number;
}) {
  const img = (
    <Image
      src="/fxgen-logo-dark.png"
      alt="fxgen"
      width={Math.round(height * 3.6)}
      height={height}
      className={`w-auto ${className}`}
      style={{ height, width: "auto" }}
      priority
    />
  );

  if (!href) return img;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="fxgen home">
      {img}
    </Link>
  );
}
