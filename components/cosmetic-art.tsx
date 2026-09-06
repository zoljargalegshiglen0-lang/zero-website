import { Icon, type IconName } from "@/components/icon";
import type { CosmeticArtwork } from "@/lib/data";

export function CosmeticArt({ artwork, label, className = "" }: { artwork: CosmeticArtwork; label: string; className?: string }) {
  const normalized = label.toLowerCase();
  const isSkin = label.includes("|");
  const icon: IconName = /gold|medal|champion|northstar|founder|crest/.test(normalized)
    ? "trophy"
    : /midnight|static|district original|sessions|hour|music/.test(normalized)
      ? "bolt"
      : artwork.atlas === "wearables"
        ? "users"
        : artwork.atlas === "accessories"
          ? "spark"
          : "globe";

  return <span className={`cosmetic-art cosmetic-${artwork.atlas} ${isSkin ? "cosmetic-skin" : ""} ${className}`} role="img" aria-label={label}>{isSkin ? <strong>{label.split("|")[0].trim()}</strong> : <Icon name={icon} size={28}/>}</span>;
}
