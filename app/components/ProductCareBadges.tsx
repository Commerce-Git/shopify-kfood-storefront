import type { ShopifyProduct } from "@/lib/shopify/types";
import { getCategoryCareStandards, type CareBadgeVariant } from "@/lib/config/categoryMaster";

interface ProductCareBadgesProps {
  product: ShopifyProduct;
  className?: string;
}

const BADGE_STYLES: Record<CareBadgeVariant, string> = {
  emerald: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  amber: "bg-amber-50/90 text-amber-900 border-amber-200/80",
  indigo: "bg-[#F3EFEA] text-[#18181B] border-[#E8DFC8]",
  stone: "bg-[#FAF8F5] text-[#27272A] border-[#E8DFC8]",
};

export default function ProductCareBadges({
  product,
  className = "",
}: ProductCareBadgesProps) {
  const careData = getCategoryCareStandards(product);
  const badges = careData.badges || [];

  if (badges.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 sm:gap-2 ${className}`}>
      {badges.map((badge) => (
        <span
          key={badge.id}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border shadow-2xs transition-colors ${
            BADGE_STYLES[badge.variant] || BADGE_STYLES.stone
          }`}
        >
          <span className="text-xs leading-none shrink-0" aria-hidden="true">
            {badge.icon}
          </span>
          <span className="font-semibold tracking-tight">{badge.label}</span>
          {badge.subtitle && (
            <span className="opacity-60 text-[10px] hidden sm:inline font-normal">
              · {badge.subtitle}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
