/**
 * Feedback form options — shared between UI and API validation.
 * Edit this file to add/remove/change feedback choices.
 */

export const SNACK_OPTIONS = [
  { id: "honey-butter-chip", label: "Honey Butter Chip", emoji: "🍯" },
  { id: "shin-ramen", label: "Shin Ramen", emoji: "🍜" },
  { id: "pepero", label: "Pepero", emoji: "🍫" },
  { id: "choco-pie", label: "Choco Pie", emoji: "🥧" },
  { id: "yakgwa", label: "Yakgwa (Traditional)", emoji: "🍪" },
  { id: "mychew", label: "Mychew Candy", emoji: "🍓" },
  { id: "tteokbokki-snack", label: "Tteokbokki Snack", emoji: "🌶️" },
  { id: "homerun-ball", label: "Homerun Ball", emoji: "⚾" },
  { id: "banana-milk", label: "Banana Milk", emoji: "🍌" },
  { id: "seaweed", label: "Roasted Seaweed", emoji: "🌿" },
];

export const CATEGORY_OPTIONS = [
  { id: "spicy-ramen", label: "Spicy Ramen", emoji: "🔥" },
  { id: "k-drinks", label: "K-Drinks (Coffee/Juice)", emoji: "🧃" },
  { id: "kdrama-kpop", label: "K-Drama / K-Pop Themed", emoji: "📺" },
  { id: "vegan", label: "Vegan / Vegetarian", emoji: "🌱" },
  { id: "healthy", label: "Healthy / Traditional", emoji: "🥜" },
  { id: "sweets-only", label: "Only Sweets & Desserts", emoji: "🍰" },
  { id: "bigger-box", label: "Bigger Box (More items!)", emoji: "📦" },
];

export const VALID_SNACK_IDS = SNACK_OPTIONS.map((s) => s.id);
export const VALID_CATEGORY_IDS = CATEGORY_OPTIONS.map((c) => c.id);

export const STAR_LABELS = ["", "Terrible", "Not great", "Okay", "Good", "Amazing!"];
