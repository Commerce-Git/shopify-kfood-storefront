/**
 * 🗺️ Unified Category Master SSOT (lib/config/categoryMaster.ts)
 * 
 * 🏛️ [아키텍처 및 Care & Safety Standards 운영 원칙 (SOP-CMP-2026-04)]
 * 
 * 1. 11대 공예 카테고리 기준 1:1 표준화 (Single Source of Truth):
 *    - 개별 상품마다 제각각 관리법을 작성하지 않고, 공예의 물리적 본질과 소재를 결정하는
 *      어드민 공식 11대 공예 카테고리를 기준으로 최고 수준의 Care & Safety Standards를 1:1 표준화합니다.
 * 
 * 2. 영문 상품명 파싱 100% 배제 (Pure Category-Driven):
 *    - 작가가 시적인 영문명("Dawn Whispers")이나 한글명("백자 달항아리")으로 등록해도,
 *      제목 문자열 긁기(String Scraping) 없이 오직 공식 카테고리/컬렉션 ID에 의해 100% 명시적으로 매핑됩니다.
 * 
 * 3. 상업용 진열대(컬렉션)와 공예 신분증(카테고리)의 관계:
 *    - 패브릭 티코스터가 쇼핑 진열대인 'Tea & Dining' 컬렉션에 진열되어 있어도,
 *      1순위 카테고리 태그(category:fabric_living)가 우선하므로 100% 패브릭 기준이 노출됩니다.
 * 
 * 4. 보수적 안전 기본값 (Safe-by-Default):
 *    - 미분류/예외 상품 유입 시 허위 표기 없이 'general_craft' 공식 아틀리에 럭셔리 보증으로 안전 안착합니다.
 * 
 * 5. 2026 글로벌 규제 준수:
 *    - US FDA 21 CFR (1,250°C/2,282°F 식품접촉), EU REACH (무니켈), 천연 식물성 원료 보증.
 */

import type { ShopifyProduct } from "@/lib/shopify/types";

export type CraftCategoryId =
  | "ceramics_dining"
  | "woodcraft_najeon"
  | "bags_pouches"
  | "jewelry_charms"
  | "hair_wear"
  | "metal_decor"
  | "fabric_living"
  | "modern_hanbok"
  | "lighting_mood"
  | "incense_wellness"
  | "hanji_stationery"
  | "general_craft";

export type CareBadgeVariant = "emerald" | "amber" | "indigo" | "stone";

export interface CareBadge {
  id: string;
  label: string;
  subtitle?: string;
  variant: CareBadgeVariant;
  icon: string;
}

export interface CategoryComplianceFlags {
  fdaFoodSafe: boolean;      // Lead & Cadmium Tested for Food Contact (US FDA 21 CFR)
  reachNickelFree: boolean;  // EU REACH Regulation No 1907/2006 Nickel Release Standard
  naturalBotanical: boolean; // 100% Organic Tree Sap / Botanical Scent
  prop65Compliant: boolean;  // California Proposition 65 Benchmark
}

export interface CategoryCareData {
  categoryKey: CraftCategoryId;
  categoryTitle: string;
  badges: CareBadge[];
  purityStatement: string;
  connoisseurCare: string[];
  firstUseRitual?: {
    title: string;
    description: string;
  };
  regulatoryFooter: string;
}

export interface CategoryMasterItem {
  id: CraftCategoryId;
  nameKo: string;
  title: string;
  navEmoji: string;
  shelfSubtitle: string;
  shopify: {
    productType: string;
    collectionHandle: string;
  };
  officialItems: string[]; // 34 official craft item whitelist from Category_Hierarchy_Master_Map.md
  compliance: CategoryComplianceFlags; // 2026 Global regulatory compliance flags
  care: CategoryCareData;
  matching: {
    collections: string[];
    productTypes: string[];
    tagKeywords: string[];
  };
}

/**
 * 🏛️ Master Registry of all 11 Craft Categories + 1 Safe Fallback
 * All category metadata, care standards, official whitelist, and compliance flags unified in one file.
 */
export const CATEGORY_REGISTRY: Record<CraftCategoryId, CategoryMasterItem> = {
  // ── 1. Ceramics & Tableware (도자기 & 다기) ──
  ceramics_dining: {
    id: "ceramics_dining",
    nameKo: "도자기 & 다기",
    title: "Ceramics & Tableware",
    navEmoji: "🍵",
    shelfSubtitle: "High-fire Joseon porcelain and artisanal Buncheong teaware",
    shopify: {
      productType: "Home & Living",
      collectionHandle: "tea-dining",
    },
    officialItems: [
      "Teacup & Mug (찻잔 및 머그)",
      "Teapot & Gaiwan (다관 및 개완)",
      "Artisanal Plate & Dish (접시 및 대접)",
      "Joseon Moon Jar (달항아리)",
      "Ceramic Vase & Object (화병 및 조형 오브제)",
      "Chopstick Rest (수저받침)",
    ],
    compliance: {
      fdaFoodSafe: true,
      reachNickelFree: false,
      naturalBotanical: false,
      prop65Compliant: true,
    },
    care: {
      categoryKey: "ceramics_dining",
      categoryTitle: "Ceramics & Tableware",
      badges: [
        {
          id: "badge_food_safe",
          label: "100% Food Safe",
          subtitle: "Lead & Cadmium Tested",
          variant: "emerald",
          icon: "🌿",
        },
        {
          id: "badge_hand_wash",
          label: "Hand Wash Recommended",
          subtitle: "Preserves Natural Glaze",
          variant: "stone",
          icon: "🧼",
        },
        {
          id: "badge_high_fire",
          label: "High-Fire Vitrified",
          subtitle: "Fired at 1,250°C / 2,282°F",
          variant: "indigo",
          icon: "🔥",
        },
      ],
      purityStatement:
        "100% Food Safe · High-fire vitrified at 1,250°C (2,282°F) using non-toxic, lead-free natural mineral glazes. Formulated to strictly comply with US FDA 21 CFR Food Contact standards and California Proposition 65 safety benchmarks.",
      connoisseurCare: [
        "Gentle Cleansing: Wash with a soft sponge and mild neutral dish soap under lukewarm water to preserve the depth of the natural mineral glaze.",
        "Thermal Shock Protection: Guard against sudden, extreme temperature contrasts (such as pouring boiling liquids into a chilled vessel or transferring directly to an oven).",
        "Microwave & Automated Dishwasher: To preserve natural clay patinas, delicate footings, and overglaze lusters over generations, gentle hand washing is advised.",
      ],
      firstUseRitual: {
        title: "The Ceramic Welcoming Ritual",
        description:
          "Welcome your ceramic vessel into your home by gently washing it with warm water before its first brew. For unglazed Buncheong clay, soaking it in warm rice water for 15 minutes enhances its natural density and seals the clay luster for years of cherished use.",
      },
      regulatoryFooter:
        "Handcrafted in Korean ateliers · Conforms to US FDA 21 CFR Food Contact standards & EU GPSR safety guidelines.",
    },
    matching: {
      collections: ["tea-dining"],
      productTypes: ["Ceramics & Tableware", "Ceramics & Dining", "Ceramics", "Dining", "Tableware", "Teaware", "Pottery"],
      tagKeywords: ["category:ceramics_dining", "tea-dining", "dining", "teaware", "ceramic", "porcelain", "celadon"],
    },
  },

  // ── 2. Woodcraft & Ottchil Lacquerware (목공예 & 나전칠기) ──
  woodcraft_najeon: {
    id: "woodcraft_najeon",
    nameKo: "목공예 & 나전칠기",
    title: "Woodcraft & Ottchil Lacquerware",
    navEmoji: "🪵",
    shelfSubtitle: "Heritage tree-sap lacquer and shimmering mother-of-pearl craftsmanship",
    shopify: {
      productType: "Home & Living",
      collectionHandle: "home-decor-doorbells",
    },
    officialItems: [
      "Najeon Inlaid Jewelry Box (나전 보석함)",
      "Najeon Namecard Case (나전 명함함)",
      "Wooden Incense Tray (원목 인센스 트레이)",
      "Miniature Soban Table (전통 미니어처 소반)",
      "Natural Ottchil Cutlery Set (천연 옻칠 수저세트)",
    ],
    compliance: {
      fdaFoodSafe: true,
      reachNickelFree: false,
      naturalBotanical: true,
      prop65Compliant: true,
    },
    care: {
      categoryKey: "woodcraft_najeon",
      categoryTitle: "Woodcraft & Ottchil Lacquerware",
      badges: [
        {
          id: "badge_ottchil",
          label: "100% Natural Ottchil",
          subtitle: "Organic Botanical Lacquer",
          variant: "amber",
          icon: "🪵",
        },
        {
          id: "badge_antibacterial",
          label: "99.9% Antibacterial",
          subtitle: "Natural Protective Shield",
          variant: "emerald",
          icon: "🛡️",
        },
        {
          id: "badge_no_dishwasher",
          label: "Dishwasher Unsafe",
          subtitle: "Gentle Lukewarm Water Only",
          variant: "stone",
          icon: "🚫",
        },
      ],
      purityStatement:
        "Finished with 100% refined botanical Ottchil (Korean Rhus verniciflua tree sap) and responsibly sourced natural mother-of-pearl (Najeon). Provides an organic 99.9% antibacterial barrier naturally resistant to moisture and mold without synthetic polyurethane.",
      connoisseurCare: [
        "Lukewarm Cleansing: To honor the organic tree sap lacquer and protect its natural antibacterial shield, cleanse gently with lukewarm water and a soft cotton cloth.",
        "Heat & Steam Care: Untamed heat and harsh detergents from automated dishwashers or microwave ovens will disrupt the natural botanical finish. Avoid boiling water immersion.",
        "Direct Sunlight Protection: Store in a serene, shaded environment away from direct UV sunlight to maintain the radiant iridescence of the inlaid mother-of-pearl.",
      ],
      firstUseRitual: {
        title: "The Ottchil Greeting",
        description:
          "Upon unboxing, you may notice the subtle, earthy aroma of natural tree sap—the unmistakable signature of authentic Korean Ottchil. Wipe gently with a soft dry cloth; the lacquer will naturally mature and deepen in luster over months of companionship.",
      },
      regulatoryFooter:
        "Handcrafted in Korean ateliers · 100% Natural Botanical Lacquer · Conforms to EU GPSR environmental benchmarks.",
    },
    matching: {
      collections: ["home-decor-doorbells", "tea-dining"],
      productTypes: ["Woodcraft & Ottchil Lacquerware", "Woodcraft", "Lacquerware", "Najeon"],
      tagKeywords: ["category:woodcraft_najeon", "ottchil", "najeon", "lacquer", "material: lacquer", "material: ottchil"],
    },
  },

  // ── 3. Bags & Pouches (가방 & 파우치) ──
  bags_pouches: {
    id: "bags_pouches",
    nameKo: "가방 & 파우치",
    title: "Heritage Bags & Pouches",
    navEmoji: "👜",
    shelfSubtitle: "Artisanal quilted Bojagi bags and traditional silk drawstring pouches",
    shopify: {
      productType: "Bags & Pouches",
      collectionHandle: "pouches-wristlets",
    },
    officialItems: [
      "Bokjumeoni Silk Pouch (양단 복주머니)",
      "Bojagi Zipper Pouch (자수 지퍼 파우치)",
      "Hobo & Shoulder Bag (보부상 숄더백)",
      "Daenggi Tote Bag (댕기 토트백)",
      "Traditional Card Wallet (비단 카드지갑)",
      "Quilted Passport Case (누비 여권케이스)",
    ],
    compliance: {
      fdaFoodSafe: false,
      reachNickelFree: true,
      naturalBotanical: false,
      prop65Compliant: true,
    },
    care: {
      categoryKey: "bags_pouches",
      categoryTitle: "Heritage Bags & Pouches",
      badges: [
        {
          id: "badge_artisan_quilted",
          label: "Artisan Quilted Weave",
          subtitle: "Heritage Textile Structure",
          variant: "stone",
          icon: "🧵",
        },
        {
          id: "badge_spot_clean",
          label: "Gentle Spot Clean",
          subtitle: "Mild Neutral Detergent",
          variant: "stone",
          icon: "🧼",
        },
        {
          id: "badge_vegetable_tanned",
          label: "Vegetable Tanned",
          subtitle: "Non-Toxic Finishing",
          variant: "emerald",
          icon: "🌿",
        },
      ],
      purityStatement:
        "Crafted with heritage-grade cotton, silk blends, and vegetable-tanned accents. Color-fastness tested to international textile standards (ISO 105-C06) and certified free of AZO dyes and harmful aromatic amines under EU REACH guidelines.",
      connoisseurCare: [
        "Spot Cleansing: Treat minor spots immediately by dabbing gently with a damp, lint-free cloth and mild diluted neutral detergent. Never rub abrasive brushes against delicate weaves.",
        "Machine Washing: Do not machine wash or tumble dry. Structured silhouettes and handmade quilting maintain their form through gentle hand care.",
        "Storage: Keep in the provided cotton dust bag with breathable paper stuffing when not in use to preserve the sculptural silhouette.",
      ],
      firstUseRitual: {
        title: "The Daily Carry Ritual",
        description:
          "Unfold the silhouette and let the natural fibers relax in a well-ventilated space for an hour. As with fine Korean Bojagi, each crease softens into a gentle patina unique to your journey.",
      },
      regulatoryFooter:
        "Handcrafted in Korean ateliers · AZO Dye-Free Textile Certification · Conforms to US FTC Care Labeling rules.",
    },
    matching: {
      collections: ["pouches-wristlets", "hobo-shoulder-bags", "wallets-passport-cases"],
      productTypes: ["Bags & Pouches", "Pouches", "Bags", "Wallets"],
      tagKeywords: ["category:bags_pouches", "pouches-wristlets", "hobo-shoulder-bags", "wallets-passport-cases", "pouch", "bag", "wallet"],
    },
  },

  // ── 4. Jewelry & Charms (장신구 & 키링) ──
  jewelry_charms: {
    id: "jewelry_charms",
    nameKo: "장신구 & 키링",
    title: "Heritage Jewelry & Charms",
    navEmoji: "✨",
    shelfSubtitle: "Silk knot Norigae, shimmering mother-of-pearl charms, and sterling silver accoutrements",
    shopify: {
      productType: "Accessories & Charms",
      collectionHandle: "keyrings-bag-charms",
    },
    officialItems: [
      "Silk Knot Norigae (전통 실크 매듭 노리개)",
      "Mother-of-Pearl Keyring (자개 키링)",
      "Solid Brass Bag Charm (황동 백참)",
      "Sterling Silver 925 Choker (순은 925 초커 목걸이)",
      "Heritage Brooch (전통 브로치)",
      "Hopae Charm (호패 참)",
    ],
    compliance: {
      fdaFoodSafe: false,
      reachNickelFree: true,
      naturalBotanical: false,
      prop65Compliant: true,
    },
    care: {
      categoryKey: "jewelry_charms",
      categoryTitle: "Heritage Jewelry & Charms",
      badges: [
        {
          id: "badge_hypoallergenic",
          label: "Hypoallergenic",
          subtitle: "Sensitive Skin Tested",
          variant: "emerald",
          icon: "✨",
        },
        {
          id: "badge_nickel_free",
          label: "Nickel-Free",
          subtitle: "EU REACH Standard Compliant",
          variant: "stone",
          icon: "🛡️",
        },
        {
          id: "badge_925_silver",
          label: "925 Sterling Silver",
          subtitle: "Premium Heritage Alloy",
          variant: "indigo",
          icon: "💎",
        },
      ],
      purityStatement:
        "Skin Safety & Purity: Formulated with 100% nickel-free, lead-free, and cadmium-free hypoallergenic brass, copper alloys, and 925 sterling silver. Tested to strictly exceed the European Union REACH Regulation (EC No 1907/2006) Nickel Release Standard (<0.5 µg/cm²/week).",
      connoisseurCare: [
        "Silk Knot Care: Protect hand-braided silk knots and tassels from contact with water, heavy perfume, or cosmetic oils. If tassels wrinkle, suspend them naturally or gently steam from 6 inches away.",
        "Metal Polishing: Gently buff silver and brass elements with a micro-polishing jeweler's cloth. Do not soak composite pieces featuring natural gemstones or mother-of-pearl in chemical dips.",
        "Aesthetic Preservation: Store individually in the airtight velvet pouch provided to prevent surface oxidation and tangling.",
      ],
      firstUseRitual: {
        title: "The Adornment Ritual",
        description:
          "Gently straighten the hand-woven silk cords with your fingers before attaching your charm. In Korean tradition, tying a Norigae knot represents weaving longevity, harmony, and good fortune into your everyday presence.",
      },
      regulatoryFooter:
        "Handcrafted in Korean ateliers · 100% Nickel-Free Hypoallergenic Certification · EU REACH & US CPSIA compliant.",
    },
    matching: {
      collections: ["keyrings-bag-charms", "necklaces-headbands"],
      productTypes: ["Accessories & Charms", "Jewelry & Charms", "Jewelry", "Accessories", "Charms"],
      tagKeywords: ["category:jewelry_charms", "keyrings-bag-charms", "necklaces-headbands", "norigae", "keyring", "charm", "jewelry"],
    },
  },

  // ── 5. Hair Wear & Binyeo (헤어웨어 & 비녀) ──
  hair_wear: {
    id: "hair_wear",
    nameKo: "헤어웨어 & 비녀",
    title: "Hair Scrunchies & Binyeo",
    navEmoji: "🌸",
    shelfSubtitle: "Sculptural wooden Binyeo hairpins and artisan-dyed silk scrunchies",
    shopify: {
      productType: "Accessories & Charms",
      collectionHandle: "hair-scrunchies-binyeo",
    },
    officialItems: [
      "Ebony Wood Binyeo (흑단목 비녀)",
      "Sterling Silver Binyeo (은비녀)",
      "Traditional Dwikoji (뒤꽂이)",
      "Baessi Daenggi (배씨댕기)",
      "Hanbok Silk Scrunchie (한복 곱창밴드)",
    ],
    compliance: {
      fdaFoodSafe: false,
      reachNickelFree: true,
      naturalBotanical: true,
      prop65Compliant: true,
    },
    care: {
      categoryKey: "hair_wear",
      categoryTitle: "Hair Scrunchies & Binyeo",
      badges: [
        {
          id: "badge_botanical_silk",
          label: "100% Botanical Silk",
          subtitle: "Toxin-Free Hair Care",
          variant: "stone",
          icon: "🌿",
        },
        {
          id: "badge_hypoallergenic_pin",
          label: "Hypoallergenic Pin",
          subtitle: "Smooth Scalp Safety",
          variant: "emerald",
          icon: "🛡️",
        },
        {
          id: "badge_ebony_craft",
          label: "Ebony & Brass Craft",
          subtitle: "Hand-Turned Masterpiece",
          variant: "indigo",
          icon: "🪵",
        },
      ],
      purityStatement:
        "Crafted with hypoallergenic smooth-polished ebony wood, silver-plated brass, and 100% mulberry silk. Finishes are hand-buffed to eliminate rough burrs and prevent hair snagging, strictly adhering to US CPSIA and EU REACH skin contact norms.",
      connoisseurCare: [
        "Binyeo Hairpin Handling: Insert with a gentle gliding motion into twisted hair buns. Never apply abrupt lateral bending force across the center of natural hardwood or horn pins.",
        "Water & Styling Spray: Keep hairpins and silk scrunchies away from direct wet hair or aerosol hair sprays containing alcohol, which can cloud natural wood oils.",
        "Silk Scrunchie Washing: Hand wash scrunchies in cold water with a drop of silk shampoo; press gently between dry towels and lay flat in shade.",
      ],
      firstUseRitual: {
        title: "The Hair Adornment Ritual",
        description:
          "Twist your hair into a firm chignon bun before sliding the Binyeo horizontally through the knot. The balanced counterweight holds your hair securely without elastane tension, honoring Joseon dynasty grace.",
      },
      regulatoryFooter:
        "Handcrafted in Korean ateliers · Snag-Free Polished Finish · EU REACH Skin Safety compliant.",
    },
    matching: {
      collections: ["hair-scrunchies-binyeo"],
      productTypes: ["Hair Wear", "Hair Scrunchies & Binyeo", "Hair Accessories"],
      tagKeywords: ["category:hair_wear", "hair-scrunchies-binyeo", "binyeo", "scrunchie", "daenggi", "hair"],
    },
  },

  // ── 6. Metal Decor & Objects (금속 데코 & 오브제) ──
  metal_decor: {
    id: "metal_decor",
    nameKo: "금속 데코 & 오브제",
    title: "Metal Crafts & Brass Decor",
    navEmoji: "🔔",
    shelfSubtitle: "Solid cast brass wind chimes, guardian doorbells, and resonant acoustic objects",
    shopify: {
      productType: "Home & Living",
      collectionHandle: "home-decor-doorbells",
    },
    officialItems: [
      "Cast Brass Fish Wind Chime (황동 물고기 풍경)",
      "Guardian Doorbell (액막이 명태 도어벨)",
      "Brass Incense Holder (황동 인센스 홀더)",
      "Heritage Metal Pin Badge (전통 금속 핀뱃지)",
    ],
    compliance: {
      fdaFoodSafe: false,
      reachNickelFree: true,
      naturalBotanical: false,
      prop65Compliant: true,
    },
    care: {
      categoryKey: "metal_decor",
      categoryTitle: "Metal Crafts & Brass Decor",
      badges: [
        {
          id: "badge_solid_brass",
          label: "Solid Cast Brass",
          subtitle: "Acoustic Resonance Purity",
          variant: "indigo",
          icon: "🔔",
        },
        {
          id: "badge_living_patina",
          label: "Living Patina Finish",
          subtitle: "Unlacquered Organic Aging",
          variant: "amber",
          icon: "✨",
        },
      ],
      purityStatement:
        "Cast in high-density traditional acoustic brass alloys (Copper-Zinc). Free of toxic lead fillers, synthetic polyurethane clear-coats, and heavy metal contaminants, allowing pure acoustic resonance and graceful oxidation over time.",
      connoisseurCare: [
        "Acoustic Wind Chime Cleansing: Wipe clean with a dry, soft microfiber cloth to remove dust. If you prefer high mirror gloss, apply a pea-sized dab of brass polish once a season.",
        "Embracing Natural Patina: If left unpolished, your brass piece will gradually develop a warm, antique golden-brown patina that records the atmosphere of your home.",
        "Indoor / Outdoor Placement: While durable against weather, prolonged outdoor rain exposure will accelerate greenish verdigris oxidation. Wipe dry after heavy dampness.",
      ],
      firstUseRitual: {
        title: "The Ringing Greeting",
        description:
          "Mount your doorbell or wind chime and ring it three times to awaken the brass tone. In Korean belief, the clear acoustic resonance of brass clarifies the room's energy and welcomes auspicious fortunes.",
      },
      regulatoryFooter:
        "Handcrafted in Korean ateliers · Solid Cast Acoustic Brass · Conforms to EU GPSR safety standards.",
    },
    matching: {
      collections: ["home-decor-doorbells"],
      productTypes: ["Metal Crafts & Brass Decor", "Metal", "Brass"],
      tagKeywords: ["category:metal_decor", "material: brass", "brass", "doorbell", "wind chime", "bell"],
    },
  },

  // ── 7. Fabric & Living (패브릭 & 리빙) ──
  fabric_living: {
    id: "fabric_living",
    nameKo: "패브릭 & 리빙",
    title: "Fabric Living & Bojagi",
    navEmoji: "🧵",
    shelfSubtitle: "Artisanal Ramie table runners, Jogakbo patchwork, and Bojagi living textiles",
    shopify: {
      productType: "Home & Living",
      collectionHandle: "tea-dining",
    },
    officialItems: [
      "Sun & Moon Bojagi Coaster (일월오봉 티코스터)",
      "Natural Ramie Table Runner (천연 모시 식탁 러너)",
      "Jogakbo Window Partition (조각보 가리개)",
      "Silk Quilted Cushion (누비 방석)",
      "Wrapping Bojagi Cloth (보자기)",
    ],
    compliance: {
      fdaFoodSafe: false,
      reachNickelFree: false,
      naturalBotanical: true,
      prop65Compliant: true,
    },
    care: {
      categoryKey: "fabric_living",
      categoryTitle: "Fabric Living & Bojagi",
      badges: [
        {
          id: "badge_natural_silk_ramie",
          label: "100% Korean Silk / Ramie",
          subtitle: "Natural Botanical Fibers",
          variant: "stone",
          icon: "🌿",
        },
        {
          id: "badge_dry_clean",
          label: "Dry Clean Recommended",
          subtitle: "Preserves Hand Stitching",
          variant: "stone",
          icon: "🧼",
        },
        {
          id: "badge_no_bleach",
          label: "Bleach Unsafe",
          subtitle: "Botanical Dye Integrity",
          variant: "stone",
          icon: "🚫",
        },
      ],
      purityStatement:
        "Woven with 100% natural Korean silk, fine Hansan ramie (Mosi), and unbleached cotton. Dyed with botanical plant extracts (indigo, gardenia, persimmon) adhering to EU REACH and US FTC Fiber Identification regulations.",
      connoisseurCare: [
        "Ramie & Silk Preservation: For pristine architectural flatness, professional dry cleaning is recommended. If hand washing, soak briefly in cold water with neutral wool detergent without wringing.",
        "Ironing Ritual: Press from the reverse side while slightly damp using a pressing cloth under low-to-medium heat (max 120°C / 248°F) to restore its crisp, translucent crispness.",
        "Sunlight Consideration: Natural botanical dyes mature gracefully; guard against long-term exposure to harsh summer sun rays to prevent uneven fading.",
      ],
      firstUseRitual: {
        title: "The Fabric Awakening",
        description:
          "Unfold your Bojagi runner and let it breathe over your dining table. The subtle crispness of natural ramie will soften into an intimate, luminous texture through daily touch.",
      },
      regulatoryFooter:
        "Handcrafted in Korean ateliers · 100% Natural Fiber Certification · US FTC & EU Textile Regulation compliant.",
    },
    matching: {
      collections: ["home-decor-doorbells", "tea-dining"],
      productTypes: ["Fabric Living & Bojagi", "Fabric", "Textile"],
      tagKeywords: ["category:fabric_living", "bojagi", "table runner", "ramie", "fabric", "textile"],
    },
  },

  // ── 8. Modern Hanbok & Apparel (생활한복 & 의류) ──
  modern_hanbok: {
    id: "modern_hanbok",
    nameKo: "생활한복 & 의류",
    title: "Modern Hanbok & Silk Wear",
    navEmoji: "👘",
    shelfSubtitle: "Contemporary silhouette Cheollik dresses, wrap skirts, and heritage silk garments",
    shopify: {
      productType: "Home & Living",
      collectionHandle: "home-decor-doorbells",
    },
    officialItems: [
      "Silk Chima Wrap Skirt (명주 허리치마)",
      "Linen Cheollik Dress (린넨 철릭 원피스)",
      "Modern Jeogori Jacket (생활한복 저고리)",
      "Natural Silk Scarf (천연 실크 스카프/머플러)",
    ],
    compliance: {
      fdaFoodSafe: false,
      reachNickelFree: false,
      naturalBotanical: true,
      prop65Compliant: true,
    },
    care: {
      categoryKey: "modern_hanbok",
      categoryTitle: "Modern Hanbok & Silk Wear",
      badges: [
        {
          id: "badge_heritage_silk",
          label: "100% Heritage Silk",
          subtitle: "Artisanal Draped Weave",
          variant: "stone",
          icon: "👘",
        },
        {
          id: "badge_dry_clean_only",
          label: "Dry Clean Only",
          subtitle: "Protects Collar Line",
          variant: "stone",
          icon: "🧼",
        },
        {
          id: "badge_cool_iron",
          label: "Cool Press With Cloth",
          subtitle: "Max 110°C / 230°F",
          variant: "stone",
          icon: "💨",
        },
      ],
      purityStatement:
        "Tailored with 100% Korean heritage silk, fine linen, and premium ramie blends. Adheres strictly to US FTC Care Labeling rules and EU textile safety norms, ensuring zero formaldehyde and non-allergenic botanical dyes.",
      connoisseurCare: [
        "Professional Dry Clean: To preserve the architectural poise of the Dongjeong collar and tailored pleating, dry cleaning is strictly recommended.",
        "Pressing & Steaming: Steam lightly from the reverse side or press under a protective cotton cloth with a cool iron (under 110°C / 230°F).",
        "Storage: Hang on broad-shouldered cedarwood hangers inside a breathable garment bag; avoid plastic polybags that trap humidity.",
      ],
      firstUseRitual: {
        title: "The Hanbok Draping Ritual",
        description:
          "Tie the Goreum ribbon firmly at the breastbone, smoothing the flowing pleats outward. The silhouette is designed to celebrate movement and airflow, blending historic royalty with modern ease.",
      },
      regulatoryFooter:
        "Handcrafted in Korean ateliers · 100% Natural Fiber Tailoring · US FTC & EU Textile Compliance.",
    },
    matching: {
      collections: ["home-decor-doorbells"],
      productTypes: ["Modern Hanbok & Silk Wear", "Modern Hanbok", "Hanbok"],
      tagKeywords: ["category:modern_hanbok", "hanbok", "cheollik", "jeogori", "chima"],
    },
  },

  // ── 9. Lighting & Mood Ambiance (한지 조명 & 무드등) ──
  lighting_mood: {
    id: "lighting_mood",
    nameKo: "한지 조명 & 무드등",
    title: "Hanji Lighting & Ambiance",
    navEmoji: "🏮",
    shelfSubtitle: "Warm diffuse Mulberry Hanji table lamps, mood lanterns, and sculpted luminaires",
    shopify: {
      productType: "Home & Living",
      collectionHandle: "home-decor-doorbells",
    },
    officialItems: [
      "Mulberry Hanji Ambient Stand (닥나무 한지 단스탠드)",
      "Ceramic Mood Lamp (도자기 무드등)",
      "Traditional Oil Lamp (전통 등잔 오브제)",
      "Hanji Lantern Shade (한지 갓)",
    ],
    compliance: {
      fdaFoodSafe: false,
      reachNickelFree: false,
      naturalBotanical: true,
      prop65Compliant: true,
    },
    care: {
      categoryKey: "lighting_mood",
      categoryTitle: "Hanji Lighting & Ambiance",
      badges: [
        {
          id: "badge_usb_5v",
          label: "Universal 5V USB",
          subtitle: "Global Voltage Safe",
          variant: "emerald",
          icon: "⚡",
        },
        {
          id: "badge_led_only",
          label: "Low-Heat LED Only",
          subtitle: "Protects Mulberry Paper",
          variant: "indigo",
          icon: "💡",
        },
        {
          id: "badge_dry_indoor",
          label: "Indoor Use Only",
          subtitle: "Keep Away From Moisture",
          variant: "stone",
          icon: "🏠",
        },
      ],
      purityStatement:
        "Crafted with 100% genuine Korean mulberry bark (Dak-jong-i) Hanji and energy-efficient 5V low-heat LED electronics. CE & FCC low-voltage certified, ensuring safe, non-flicker ambient light without paper degradation.",
      connoisseurCare: [
        "Light Source Compatibility: Use only cool-running LED bulbs (maximum 5W / 5V USB). Never install high-heat incandescent or halogen bulbs, which can scorch organic mulberry paper.",
        "Dry Dusting: Clean Hanji paper shades gently with a feather duster or dry microfiber cloth. Never wipe with wet sponges or chemical aerosol cleaners.",
        "Environmental Protection: Keep away from humid bathrooms, outdoor open windows, or steam diffusers to preserve paper tension.",
      ],
      firstUseRitual: {
        title: "The Lantern Awakening",
        description:
          "Connect the USB power cord in a dimly lit room and observe the warm, dappled diffusion through the natural mulberry fibers. The microscopic bark textures create a calm, meditative sanctuary.",
      },
      regulatoryFooter:
        "Handcrafted in Korean ateliers · Low-Voltage CE/FCC Safety Certified · EU GPSR compliant.",
    },
    matching: {
      collections: ["home-decor-doorbells"],
      productTypes: ["Hanji Lighting & Ambiance", "Lighting", "Lamp"],
      tagKeywords: ["category:lighting_mood", "material: hanji", "lighting", "lamp", "lantern", "hanji light"],
    },
  },

  // ── 10. Incense & Wellness (향 & 인센스) ──
  incense_wellness: {
    id: "incense_wellness",
    nameKo: "향 & 인센스",
    title: "Incense & Wellness",
    navEmoji: "🕊️",
    shelfSubtitle: "Natural botanical Sunhyang sticks, calming agarwood, and meditative fragrance holders",
    shopify: {
      productType: "Home & Living",
      collectionHandle: "home-decor-doorbells",
    },
    officialItems: [
      "Agarwood Traditional Sunhyang (침향 선향 스틱)",
      "Natural Cone Incense (삼각 뿔향)",
      "Pure Silk Fragrant Sachet (명주실 향낭)",
      "Ceramic Incense Burner (도자기 향로)",
    ],
    compliance: {
      fdaFoodSafe: false,
      reachNickelFree: false,
      naturalBotanical: true,
      prop65Compliant: true,
    },
    care: {
      categoryKey: "incense_wellness",
      categoryTitle: "Incense & Wellness",
      badges: [
        {
          id: "badge_pure_botanical",
          label: "100% Pure Botanical",
          subtitle: "Zero Synthetic Charcoal",
          variant: "emerald",
          icon: "🌿",
        },
        {
          id: "badge_phthalate_free",
          label: "Phthalate-Free",
          subtitle: "Clean Smoke Tested",
          variant: "stone",
          icon: "🛡️",
        },
        {
          id: "badge_heat_holder",
          label: "Heat-Resistant Holder",
          subtitle: "Safe Burning Required",
          variant: "amber",
          icon: "🔥",
        },
      ],
      purityStatement:
        "Extracted exclusively from wild botanical woods, natural herbal binders (Machilus thunbergii bark), and pure essential extracts. Tested 100% free of synthetic phthalates, dipping solvents, coal tar, and synthetic fragrance boosters.",
      connoisseurCare: [
        "Safe Burning: Always place ignited sticks into a stable, heat-resistant ceramic, stone, or brass holder. Ensure burning incense is kept away from drafts, curtains, and unattended spaces.",
        "Ventilation Ritual: Burn in spaces with gentle natural airflow to allow the delicate woody notes to disperse gracefully rather than concentrating heavily.",
        "Storage: Keep incense sticks in their original Paulownia wood box or glass container in a cool, dry place to prevent moisture softening.",
      ],
      firstUseRitual: {
        title: "The Mindful Burn",
        description:
          "Light the tip of the stick and gently blow out the flame after 5 seconds, leaving a glowing red ember. In Korean Sunhyang tradition, watching the single plume of smoke rise clarifies the mind and welcomes tranquility.",
      },
      regulatoryFooter:
        "Handcrafted in Korean ateliers · 100% Natural Botanical Ingredients · IFRA & EU Safety compliant.",
    },
    matching: {
      collections: ["home-decor-doorbells"],
      productTypes: ["Incense & Wellness", "Wellness", "Incense"],
      tagKeywords: ["category:incense_wellness", "incense", "sunhyang", "sachet", "diffuser"],
    },
  },

  // ── 11. Hanji Stationery & Fans (한지 문구 & 부채) ──
  hanji_stationery: {
    id: "hanji_stationery",
    nameKo: "한지 문구 & 부채",
    title: "Hanji Stationery & Fans",
    navEmoji: "📜",
    shelfSubtitle: "Artisanal Damyang bamboo folding fans, mulberry journals, and calligraphy objects",
    shopify: {
      productType: "Home & Living",
      collectionHandle: "home-decor-doorbells",
    },
    officialItems: [
      "Handcrafted Bamboo Hapjukseon (담양 합죽선 전통 부채)",
      "Mulberry Bark Hanji Journal (닥나무 한지 노트)",
      "Heritage Brass Bookmark (금속 책갈피)",
      "Calligraphy Paperweight (전통 문진)",
    ],
    compliance: {
      fdaFoodSafe: false,
      reachNickelFree: true,
      naturalBotanical: true,
      prop65Compliant: true,
    },
    care: {
      categoryKey: "hanji_stationery",
      categoryTitle: "Hanji Stationery & Fans",
      badges: [
        {
          id: "badge_mulberry_hanji",
          label: "100% Mulberry Hanji",
          subtitle: "1,000-Year Paper Durability",
          variant: "stone",
          icon: "📜",
        },
        {
          id: "badge_damyang_bamboo",
          label: "Damyang Bamboo Ribs",
          subtitle: "Hand-Carved Flexibility",
          variant: "indigo",
          icon: "🎋",
        },
        {
          id: "badge_dry_storage",
          label: "Dry Storage Only",
          subtitle: "Keep Away From Rain",
          variant: "stone",
          icon: "💧",
        },
      ],
      purityStatement:
        "Handmade using 100% unbleached Korean mulberry fibers and aged Damyang bamboo ribs. Acid-free pH neutral paper engineered to last over one thousand years without yellowing or brittle degradation.",
      connoisseurCare: [
        "Hapjukseon Fan Handling: Open and close with smooth, deliberate wrist momentum. Never force the fan ribs past their natural radial pivot angle.",
        "Moisture Protection: Protect natural paper folds and bamboo ribs from contact with rainwater or excessive humidity.",
        "Storage: Keep the folded fan inside its padded protective brocade sleeve when carrying in your bag.",
      ],
      firstUseRitual: {
        title: "The Scholar's Unboxing",
        description:
          "Gently slide open the bamboo ribs and inhale the subtle aroma of natural bamboo and aged paper. For centuries, Joseon scholars carried Hapjukseon as a symbol of mental clarity and calm dignity.",
      },
      regulatoryFooter:
        "Handcrafted in Korean ateliers · Acid-Free Archival Paper · EU GPSR compliant.",
    },
    matching: {
      collections: ["home-decor-doorbells"],
      productTypes: ["Hanji Stationery & Fans", "Stationery"],
      tagKeywords: ["category:hanji_stationery", "fan", "stationery", "hanji notebook", "bookmark", "folding fan"],
    },
  },

  // ── ★ Safe-by-Default Fallback (한국 정통 수공예품 럭셔리 기본값) ──
  general_craft: {
    id: "general_craft",
    nameKo: "한국 전통 공예품 (안전 기본값)",
    title: "Authentic Korean Handcrafted Goods",
    navEmoji: "🇰🇷",
    shelfSubtitle: "Authentic Korean heritage handcrafted objects created by master ateliers",
    shopify: {
      productType: "Home & Living",
      collectionHandle: "home-decor-doorbells",
    },
    officialItems: [
      "Unclassified Korean Master Craftwork (한국 정통 수공예품 공통)",
    ],
    compliance: {
      fdaFoodSafe: false,
      reachNickelFree: true,
      naturalBotanical: true,
      prop65Compliant: true,
    },
    care: {
      categoryKey: "general_craft",
      categoryTitle: "Authentic Korean Handcrafted Goods",
      badges: [
        {
          id: "badge_made_in_korea",
          label: "Made in Korea",
          subtitle: "Verified Master Atelier",
          variant: "emerald",
          icon: "🇰🇷",
        },
        {
          id: "badge_artisan_handcrafted",
          label: "Artisan Handcrafted",
          subtitle: "Individual Uniqueness",
          variant: "indigo",
          icon: "✨",
        },
        {
          id: "badge_gentle_care",
          label: "Gentle Care",
          subtitle: "Lukewarm Water & Soft Cloth",
          variant: "stone",
          icon: "🧼",
        },
      ],
      purityStatement:
        "Crafted by verified artisan ateliers across South Korea. Created with non-toxic, sustainable materials honoring ancient Korean heritage craftsmanship and global product safety benchmarks.",
      connoisseurCare: [
        "Thoughtful Care: Handle with thoughtful care. Clean gently with a soft dry or slightly damp cotton cloth.",
        "Environmental Protection: Guard against prolonged exposure to extreme temperature contrasts, high moisture, or harsh direct sun rays.",
        "Individual Uniqueness: Subtle variations in glaze, wood grain, or weave are the authentic hallmarks of human craftsmanship.",
      ],
      firstUseRitual: {
        title: "The Craft Welcoming",
        description:
          "Inspect the subtle variations in texture and tone—the true signatures of human hands and heritage mastery. Welcome this piece of Korean heritage into your daily life and sacred space.",
      },
      regulatoryFooter:
        "Handcrafted in Korean ateliers · Dispatched direct from Korea · EU GPSR & US Product Safety compliant.",
    },
    matching: {
      collections: [],
      productTypes: [],
      tagKeywords: [],
    },
  },
};

/**
 * ⚡ O(1) Fast Lookup Maps for Serverless & Edge Resolvers
 */
const CATEGORY_BY_ID = new Map<string, CategoryMasterItem>(
  Object.values(CATEGORY_REGISTRY).map((item) => [item.id, item])
);

export function getCategoryMasterById(id: CraftCategoryId): CategoryMasterItem {
  return CATEGORY_BY_ID.get(id) || CATEGORY_REGISTRY.general_craft;
}

/**
 * 🎯 Pure Category & Collection-Driven Automatic Resolver (v5.0)
 * 
 * 100% Pure Category Matching without English Title String Scraping:
 * - Priority 1: Authoritative 11-Craft Category ID/Tag or explicit ProductType (from Admin Wizard)
 * - Priority 2: Shopify 8 Direct Single-Mapping Collections (Whitelist Bridge)
 * - Priority 3: Multi-Craft Collection (Home Decor & Doorbells) Sub-Craft Material Disambiguation
 * - Priority 4: Broad Material / Craft Category Fallback
 * - Priority 5: Safe-by-Default Fallback (general_craft)
 */
export function getCategoryMasterItem(product: ShopifyProduct): CategoryMasterItem {
  if (!product) return CATEGORY_REGISTRY.general_craft;

  const rawType = (product.productType || "").toLowerCase();
  const rawTags = (product.tags || []).map((t) => t.toLowerCase());
  const tagString = rawTags.join(" ");

  // ── PRIORITY 1: Explicit 11-Craft Category ID or Authoritative ProductType (SSOT) ──
  if (
    tagString.includes("category:ceramics_dining") ||
    rawType === "ceramics & dining" ||
    rawType === "ceramics & tableware" ||
    rawType === "ceramics" ||
    rawType === "pottery"
  ) {
    return CATEGORY_REGISTRY.ceramics_dining;
  }

  if (
    tagString.includes("category:woodcraft_najeon") ||
    rawType === "woodcraft & ottchil lacquerware" ||
    rawType === "woodcraft" ||
    rawType === "lacquerware" ||
    rawType === "najeon"
  ) {
    return CATEGORY_REGISTRY.woodcraft_najeon;
  }

  if (
    tagString.includes("category:bags_pouches") ||
    rawType === "bags & pouches" ||
    rawType === "pouches" ||
    rawType === "bags" ||
    rawType === "wallets"
  ) {
    return CATEGORY_REGISTRY.bags_pouches;
  }

  if (
    tagString.includes("category:hair_wear") ||
    rawType === "hair wear" ||
    rawType === "hair scrunchies & binyeo" ||
    rawType === "hair accessories"
  ) {
    return CATEGORY_REGISTRY.hair_wear;
  }

  if (
    tagString.includes("category:jewelry_charms") ||
    rawType === "jewelry & charms" ||
    rawType === "accessories & charms" ||
    rawType === "jewelry" ||
    rawType === "charms"
  ) {
    // Disambiguate if hair wear is tagged
    if (tagString.includes("hair-scrunchies-binyeo") || tagString.includes("binyeo") || tagString.includes("scrunchie")) {
      return CATEGORY_REGISTRY.hair_wear;
    }
    return CATEGORY_REGISTRY.jewelry_charms;
  }

  if (
    tagString.includes("category:metal_decor") ||
    rawType === "metal crafts & brass decor" ||
    rawType === "metal" ||
    rawType === "brass"
  ) {
    return CATEGORY_REGISTRY.metal_decor;
  }

  if (
    tagString.includes("category:fabric_living") ||
    rawType === "fabric living & bojagi" ||
    rawType === "fabric" ||
    rawType === "textile"
  ) {
    return CATEGORY_REGISTRY.fabric_living;
  }

  if (
    tagString.includes("category:modern_hanbok") ||
    rawType === "modern hanbok & silk wear" ||
    rawType === "modern hanbok" ||
    rawType === "hanbok"
  ) {
    return CATEGORY_REGISTRY.modern_hanbok;
  }

  if (
    tagString.includes("category:lighting_mood") ||
    rawType === "hanji lighting & ambiance" ||
    rawType === "lighting" ||
    rawType === "lamp"
  ) {
    return CATEGORY_REGISTRY.lighting_mood;
  }

  if (
    tagString.includes("category:incense_wellness") ||
    rawType === "incense & wellness" ||
    rawType === "wellness" ||
    rawType === "incense"
  ) {
    return CATEGORY_REGISTRY.incense_wellness;
  }

  if (
    tagString.includes("category:hanji_stationery") ||
    rawType === "hanji stationery & fans" ||
    rawType === "stationery"
  ) {
    return CATEGORY_REGISTRY.hanji_stationery;
  }

  // ── PRIORITY 2: Shopify 8 Direct Single-Mapping Collections (Whitelist Bridge) ──
  // A. Hair Wear Collection
  if (tagString.includes("hair-scrunchies-binyeo") || tagString.includes("hair scrunchies & binyeo")) {
    return CATEGORY_REGISTRY.hair_wear;
  }

  // B. Keyrings & Charms Collection
  if (
    tagString.includes("keyrings-bag-charms") ||
    tagString.includes("keyrings & bag charms") ||
    tagString.includes("necklaces-headbands")
  ) {
    return CATEGORY_REGISTRY.jewelry_charms;
  }

  // C. Bags & Pouches Collections
  if (
    tagString.includes("pouches-wristlets") ||
    tagString.includes("pouches & wristlets") ||
    tagString.includes("hobo-shoulder-bags") ||
    tagString.includes("hobo & shoulder bags") ||
    tagString.includes("wallets-passport-cases") ||
    tagString.includes("wallets & passport cases")
  ) {
    return CATEGORY_REGISTRY.bags_pouches;
  }

  // D. Tea & Dining Collection (Defaults to Ceramics & Tableware; Ottchil if tagged)
  if (tagString.includes("tea-dining") || tagString.includes("tea & dining") || rawType.includes("dining")) {
    if (tagString.includes("ottchil") || tagString.includes("lacquer") || tagString.includes("wood")) {
      return CATEGORY_REGISTRY.woodcraft_najeon;
    }
    return CATEGORY_REGISTRY.ceramics_dining;
  }

  // ── PRIORITY 3: Multi-Craft Collection (Home Decor & Doorbells) Material Disambiguation ──
  if (
    tagString.includes("home-decor-doorbells") ||
    tagString.includes("home decor & doorbells") ||
    rawType === "home & living" ||
    rawType.includes("decor")
  ) {
    if (
      tagString.includes("material: brass") ||
      tagString.includes("material: metal") ||
      tagString.includes("brass") ||
      rawTags.some((t) => t === "doorbell" || t === "bell" || t.includes("wind chime") || t.includes("fish chime"))
    ) {
      return CATEGORY_REGISTRY.metal_decor;
    }
    if (
      tagString.includes("material: lacquer") ||
      tagString.includes("material: ottchil") ||
      tagString.includes("ottchil") ||
      tagString.includes("najeon") ||
      tagString.includes("lacquer") ||
      tagString.includes("woodcraft")
    ) {
      return CATEGORY_REGISTRY.woodcraft_najeon;
    }
    if (
      tagString.includes("material: hanji") ||
      tagString.includes("lighting") ||
      tagString.includes("lamp") ||
      tagString.includes("lantern")
    ) {
      return CATEGORY_REGISTRY.lighting_mood;
    }
    if (
      tagString.includes("incense") ||
      tagString.includes("sunhyang") ||
      tagString.includes("sachet") ||
      tagString.includes("wellness")
    ) {
      return CATEGORY_REGISTRY.incense_wellness;
    }
    if (
      tagString.includes("fan") ||
      tagString.includes("stationery") ||
      tagString.includes("journal") ||
      tagString.includes("bookmark")
    ) {
      return CATEGORY_REGISTRY.hanji_stationery;
    }
    if (
      tagString.includes("material: ceramic") ||
      tagString.includes("material: porcelain") ||
      tagString.includes("celadon") ||
      tagString.includes("buncheong") ||
      tagString.includes("porcelain") ||
      tagString.includes("vase")
    ) {
      return CATEGORY_REGISTRY.ceramics_dining;
    }
    if (tagString.includes("hanbok") || tagString.includes("cheollik")) {
      return CATEGORY_REGISTRY.modern_hanbok;
    }
    if (
      tagString.includes("bojagi") ||
      tagString.includes("runner") ||
      tagString.includes("cushion") ||
      tagString.includes("fabric") ||
      tagString.includes("ramie")
    ) {
      return CATEGORY_REGISTRY.fabric_living;
    }
  }

  // ── PRIORITY 4: Broad Tag & Material Fallbacks ──
  if (tagString.includes("binyeo") || tagString.includes("scrunchie")) {
    return CATEGORY_REGISTRY.hair_wear;
  }
  if (tagString.includes("norigae") || tagString.includes("keyring") || tagString.includes("charm")) {
    return CATEGORY_REGISTRY.jewelry_charms;
  }
  if (tagString.includes("ceramic") || tagString.includes("porcelain") || tagString.includes("tableware")) {
    return CATEGORY_REGISTRY.ceramics_dining;
  }
  if (tagString.includes("ottchil") || tagString.includes("lacquer") || tagString.includes("najeon")) {
    return CATEGORY_REGISTRY.woodcraft_najeon;
  }
  if (tagString.includes("pouch") || tagString.includes("bag") || tagString.includes("wallet")) {
    return CATEGORY_REGISTRY.bags_pouches;
  }
  if (tagString.includes("brass") || rawTags.some((t) => t === "doorbell" || t.includes("wind chime"))) {
    return CATEGORY_REGISTRY.metal_decor;
  }
  if (tagString.includes("incense") || tagString.includes("sunhyang")) {
    return CATEGORY_REGISTRY.incense_wellness;
  }
  if (tagString.includes("lighting") || tagString.includes("lamp") || tagString.includes("hanji light")) {
    return CATEGORY_REGISTRY.lighting_mood;
  }
  if (tagString.includes("hanbok") || tagString.includes("cheollik")) {
    return CATEGORY_REGISTRY.modern_hanbok;
  }
  if (tagString.includes("bojagi") || tagString.includes("ramie") || tagString.includes("fabric")) {
    return CATEGORY_REGISTRY.fabric_living;
  }
  if (tagString.includes("fan") || tagString.includes("stationery") || tagString.includes("bookmark")) {
    return CATEGORY_REGISTRY.hanji_stationery;
  }

  // ── PRIORITY 5: Safe-by-Default Fallback (general_craft) ──
  return CATEGORY_REGISTRY.general_craft;
}

/**
 * Direct Care Standards extractor (for ProductTrustAccordions & ProductCareBadges)
 */
export function getCategoryCareStandards(product: ShopifyProduct): CategoryCareData {
  return getCategoryMasterItem(product).care;
}
