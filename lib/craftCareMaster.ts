/**
 * 🍵 Global D2C Craft Safety & Care Standards (SOP-CMP-2026-04)
 * Backward-compatible facade delegating to the unified SSOT: @/lib/config/categoryMaster
 */

export * from "@/lib/config/categoryMaster";

import {
  CATEGORY_REGISTRY,
  getCategoryCareStandards,
  type CraftCategoryId,
  type CategoryCareData,
} from "@/lib/config/categoryMaster";

/**
 * Backward-compatible dictionary mapping
 */
export const CRAFT_CARE_MASTER: Record<string, CategoryCareData> = Object.fromEntries(
  Object.entries(CATEGORY_REGISTRY).map(([key, val]) => [key, val.care])
) as Record<CraftCategoryId, CategoryCareData>;

export { getCategoryCareStandards };
