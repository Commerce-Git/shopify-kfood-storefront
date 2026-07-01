/**
 * Product category & review feedback options — shared between UI and API validation.
 * Edit this file to add/remove/change feedback choices.
 */

export const PRODUCT_OPTIONS = [
  { id: "pouch-bag", label: "Pouch / Bag", emoji: "👜" },
  { id: "hair-accessory", label: "Hair Accessory", emoji: "💇‍♀️" },
  { id: "keyring-charm", label: "Keyring / Charm", emoji: "🔑" },
  { id: "wallet-card-case", label: "Wallet / Card Case", emoji: "💳" },
  { id: "home-decor", label: "Home Décor", emoji: "🏠" },
  { id: "traditional-fan", label: "Traditional Fan", emoji: "🪭" },
  { id: "jewelry", label: "Jewelry / Necklace", emoji: "📿" },
  { id: "stationery", label: "Stationery", emoji: "✏️" },
  { id: "textile", label: "Textile / Fabric", emoji: "🧵" },
  { id: "other", label: "Other", emoji: "✨" },
];

export const CATEGORY_OPTIONS = [
  { id: "gift-for-friend", label: "Gift for a Friend", emoji: "🎁" },
  { id: "personal-use", label: "For Myself", emoji: "💃" },
  { id: "home-styling", label: "Home Styling", emoji: "🏡" },
  { id: "k-culture-fan", label: "K-Culture Fan Items", emoji: "🇰🇷" },
  { id: "traditional-craft", label: "Traditional Crafts", emoji: "🏺" },
  { id: "modern-korean", label: "Modern Korean Design", emoji: "✨" },
  { id: "more-artisans", label: "More Artisan Collabs!", emoji: "🤝" },
];

/** @deprecated Use PRODUCT_OPTIONS instead. Kept for backward compatibility. */
export const SNACK_OPTIONS = PRODUCT_OPTIONS;

export const VALID_SNACK_IDS = PRODUCT_OPTIONS.map((s) => s.id);
export const VALID_CATEGORY_IDS = CATEGORY_OPTIONS.map((c) => c.id);

export const STAR_LABELS = ["", "Terrible", "Not great", "Okay", "Good", "Amazing!"];
