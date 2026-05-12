// Shared amenity definitions — used in setup wizard and admin panel
export const AMENITY_CATEGORIES = [
  {
    category: "Internet & Tech",
    items: [
      { key: "wifi",             label: "Wi-Fi",                icon: "📶" },
      { key: "highSpeedWifi",    label: "High-speed Wi-Fi",     icon: "⚡" },
      { key: "tv",               label: "Smart TV",             icon: "📺" },
      { key: "netflix",          label: "Netflix / Streaming",  icon: "🎬" },
      { key: "workspace",        label: "Work desk",            icon: "💻" },
    ],
  },
  {
    category: "Climate",
    items: [
      { key: "ac",               label: "Air conditioning",     icon: "❄️" },
      { key: "heating",          label: "Heating",              icon: "🔆" },
      { key: "fan",              label: "Ceiling / floor fan",  icon: "🌀" },
    ],
  },
  {
    category: "Kitchen",
    items: [
      { key: "kitchen",          label: "Full kitchen",         icon: "🍳" },
      { key: "dishwasher",       label: "Dishwasher",           icon: "🍽️" },
      { key: "coffee",           label: "Coffee machine",       icon: "☕" },
      { key: "microwave",        label: "Microwave",            icon: "📡" },
      { key: "oven",             label: "Oven",                 icon: "🫕" },
      { key: "toaster",          label: "Toaster",              icon: "🍞" },
      { key: "fridge",           label: "Refrigerator",         icon: "🧊" },
      { key: "freezer",          label: "Freezer",              icon: "🥶" },
      { key: "kettle",           label: "Electric kettle",      icon: "🫖" },
      { key: "cookware",         label: "Pots, pans & utensils",icon: "🥄" },
    ],
  },
  {
    category: "Bathroom",
    items: [
      { key: "hairdryer",        label: "Hair dryer",           icon: "💨" },
      { key: "toiletries",       label: "Toiletries provided",  icon: "🧴" },
      { key: "bathtub",          label: "Bathtub",              icon: "🛁" },
      { key: "hotTub",           label: "Hot tub / Jacuzzi",    icon: "🌊" },
    ],
  },
  {
    category: "Laundry",
    items: [
      { key: "washer",           label: "Washing machine",      icon: "🫧" },
      { key: "dryer",            label: "Dryer",                icon: "🌬️" },
      { key: "iron",             label: "Iron & ironing board", icon: "👔" },
      { key: "linens",           label: "Bed linens included",  icon: "🛏️" },
      { key: "towels",           label: "Towels included",      icon: "🏷️" },
    ],
  },
  {
    category: "Outdoor & Beach",
    items: [
      { key: "terrace",          label: "Terrace / balcony",    icon: "🌅" },
      { key: "garden",           label: "Garden / yard",        icon: "🌿" },
      { key: "bbq",              label: "BBQ grill",            icon: "🔥" },
      { key: "outdoorFurniture", label: "Outdoor furniture",    icon: "🪑" },
      { key: "pool",             label: "Swimming pool",        icon: "🏊" },
      { key: "beachAccess",      label: "Beach access",         icon: "🏖️" },
      { key: "beachTowels",      label: "Beach towels",         icon: "🤿" },
      { key: "beachChairs",      label: "Sun loungers / chairs",icon: "🪂" },
      { key: "beachUmbrella",    label: "Beach umbrella",       icon: "☂️" },
      { key: "bikes",            label: "Bicycles available",   icon: "🚲" },
    ],
  },
  {
    category: "Views",
    items: [
      { key: "seaView",          label: "Sea view",             icon: "👁️" },
      { key: "mountainView",     label: "Mountain view",        icon: "⛰️" },
      { key: "gardenView",       label: "Garden view",          icon: "🌳" },
    ],
  },
  {
    category: "Parking & Access",
    items: [
      { key: "parking",          label: "Free parking",         icon: "🅿️" },
      { key: "garage",           label: "Garage",               icon: "🏠" },
      { key: "selfCheckIn",      label: "Self check-in",        icon: "🔑" },
      { key: "elevator",         label: "Elevator / lift",      icon: "🛗" },
      { key: "groundFloor",      label: "Ground floor (no stairs)", icon: "🚪" },
    ],
  },
  {
    category: "Safety",
    items: [
      { key: "smokeAlarm",       label: "Smoke alarm",          icon: "🚨" },
      { key: "firstAid",         label: "First aid kit",        icon: "🩺" },
      { key: "fireExtinguisher", label: "Fire extinguisher",    icon: "🧯" },
      { key: "safeBox",          label: "Safe / lockbox",       icon: "🔒" },
    ],
  },
  {
    category: "Family & Kids",
    items: [
      { key: "crib",             label: "Baby crib / cot",      icon: "👶" },
      { key: "highChair",        label: "High chair",           icon: "🪑" },
      { key: "childrenGames",    label: "Board games / toys",   icon: "🎲" },
    ],
  },
  {
    category: "Extras",
    items: [
      { key: "petFriendly",      label: "Pet friendly",         icon: "🐾" },
      { key: "breakfast",        label: "Breakfast included",   icon: "🥐" },
      { key: "welcomeBasket",    label: "Welcome basket",       icon: "🧺" },
    ],
  },
];

export type AmenityItem = { key: string; label: string; icon: string };
export type AmenityCategory = { category: string; items: AmenityItem[] };
export const ALL_AMENITIES: AmenityItem[] = AMENITY_CATEGORIES.flatMap(c => c.items);
