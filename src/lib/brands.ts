import type { Brand } from "./types";

export function upsertBrand(brands: Brand[] | undefined, name: string): Brand[] {
  const trimmed = name.trim();
  const current = brands ?? [];
  if (!trimmed) return current;
  if (
    current.some((brand) => brand.name.toLowerCase() === trimmed.toLowerCase())
  ) {
    return current;
  }
  return [
    ...current,
    {
      id: `brd-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmed,
      city: "Malaysia",
      outlets: "To confirm",
    },
  ];
}
