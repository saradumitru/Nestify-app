import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import api from "../services/api";
import Navbar from "../components/Navbar";
import usePersistentState from "../hooks/usePersistentState";

const fmt = (value) =>
  new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    maximumFractionDigits: 0,
  }).format(value);

const ROOMS = [
  { key: "bedroom", label: "Dormitor", desc: "Odihnă, depozitare și atmosferă calmă" },
  { key: "living", label: "Living", desc: "Relaxare, socializare și zona principală a casei" },
  { key: "kitchen", label: "Bucătărie", desc: "Mobilier, electrocasnice și funcționalitate zilnică" },
  { key: "office", label: "Birou", desc: "Productivitate, ergonomie și depozitare" },
];

const LEVELS = [
  { key: "low", label: "Redus", desc: "Soluții accesibile, second-hand, DIY și piese modulare" },
  { key: "medium", label: "Mediu", desc: "Mix echilibrat între calitate, preț și durabilitate" },
  { key: "high", label: "Ridicat", desc: "Materiale mai bune, piese premium și personalizare" },
];

const AREA_COST = {
  low: 80,
  medium: 150,
  high: 280,
};

const BUDGET_ITEMS = [
  { room: "bedroom", category: "Mobilier", key: "bed", name: "Pat + saltea", low: { min: 800, max: 1500 }, medium: { min: 1500, max: 3200 }, high: { min: 3500, max: 8000 } },
  { room: "bedroom", category: "Mobilier", key: "wardrobe", name: "Dulap / dressing", low: { min: 600, max: 1200 }, medium: { min: 1400, max: 3000 }, high: { min: 3500, max: 9000 }, options: [
    { key: "modular", label: "Modular", multiplier: 1 },
    { key: "custom", label: "La comandă", multiplier: 1.65 },
    { key: "walkin", label: "Dressing walk-in", multiplier: 2.3 },
  ] },
  { room: "bedroom", category: "Mobilier", key: "nightstands", name: "Noptieră", unit: "buc.", quantityEnabled: true, defaultQty: 2, minQty: 1, maxQty: 2, low: { min: 80, max: 200 }, medium: { min: 225, max: 500 }, high: { min: 600, max: 1500 } },
  { room: "bedroom", category: "Textile", key: "rug", name: "Covor", unit: "buc.", quantityEnabled: true, defaultQty: 1, minQty: 1, maxQty: 3, low: { min: 150, max: 350 }, medium: { min: 350, max: 800 }, high: { min: 900, max: 2200 } },
  { room: "bedroom", category: "Textile", key: "curtains", name: "Set perdele / draperii", unit: "set", quantityEnabled: true, defaultQty: 1, minQty: 1, maxQty: 3, low: { min: 120, max: 300 }, medium: { min: 350, max: 900 }, high: { min: 1000, max: 2600 }, options: [
    { key: "curtains", label: "Perdele simple", multiplier: 0.85 },
    { key: "drapes", label: "Perdele + draperii", multiplier: 1.2 },
    { key: "blackout", label: "Blackout / material premium", multiplier: 1.55 },
  ] },
  { room: "bedroom", category: "Iluminat", key: "lights", name: "Corp de iluminat / veioză", unit: "buc.", quantityEnabled: true, defaultQty: 2, minQty: 1, maxQty: 6, low: { min: 75, max: 175 }, medium: { min: 225, max: 600 }, high: { min: 750, max: 2000 } },
  { room: "bedroom", category: "Finisaje", key: "wall_finish", name: "Perete accent", low: { min: 250, max: 700 }, medium: { min: 800, max: 1800 }, high: { min: 2200, max: 6000 }, options: [
    { key: "paint", label: "Vopsea lavabilă / accent color", multiplier: 0.75 },
    { key: "wallpaper", label: "Tapet", multiplier: 1.15 },
    { key: "panels", label: "Panouri decorative", multiplier: 1.55 },
  ] },
  { room: "bedroom", category: "Decor", key: "decor", name: "Decorațiune", unit: "buc.", quantityEnabled: true, defaultQty: 4, minQty: 1, maxQty: 20, low: { min: 25, max: 75 }, medium: { min: 90, max: 225 }, high: { min: 250, max: 750 }, options: [
    { key: "frames", label: "Tablouri / rame", multiplier: 1 },
    { key: "plants", label: "Plante / vaze", multiplier: 0.85 },
    { key: "art", label: "Artă decorativă premium", multiplier: 1.8 },
  ] },

  { room: "living", category: "Mobilier", key: "sofa", name: "Canapea / colțar", low: { min: 1200, max: 2500 }, medium: { min: 3000, max: 6500 }, high: { min: 8000, max: 22000 }, options: [
    { key: "straight_fabric", label: "Canapea simplă, stofă", multiplier: 0.9 },
    { key: "corner_fabric", label: "Colțar, stofă", multiplier: 1.35 },
    { key: "leather", label: "Piele / material premium", multiplier: 1.75 },
  ] },
  { room: "living", category: "Mobilier", key: "coffee", name: "Măsuță de cafea", low: { min: 250, max: 600 }, medium: { min: 700, max: 1600 }, high: { min: 2000, max: 5000 }, options: [
    { key: "wood", label: "Lemn / PAL furniruit", multiplier: 1 },
    { key: "glass", label: "Sticlă + metal", multiplier: 1.15 },
    { key: "stone", label: "Marmură / piatră", multiplier: 1.75 },
  ] },
  { room: "living", category: "Mobilier", key: "tv", name: "Comodă TV", low: { min: 350, max: 800 }, medium: { min: 900, max: 2400 }, high: { min: 3000, max: 7000 } },
  { room: "living", category: "Mobilier", key: "shelf", name: "Bibliotecă / rafturi", low: { min: 300, max: 800 }, medium: { min: 900, max: 2500 }, high: { min: 3000, max: 8500 } },
  { room: "living", category: "Textile", key: "rug", name: "Covor", unit: "buc.", quantityEnabled: true, defaultQty: 1, minQty: 1, maxQty: 3, low: { min: 200, max: 500 }, medium: { min: 600, max: 1600 }, high: { min: 2000, max: 5500 } },
  { room: "living", category: "Textile", key: "curtains", name: "Set draperii", unit: "set", quantityEnabled: true, defaultQty: 1, minQty: 1, maxQty: 3, low: { min: 200, max: 500 }, medium: { min: 600, max: 1500 }, high: { min: 2000, max: 5000 }, options: [
    { key: "curtains", label: "Perdele simple", multiplier: 0.8 },
    { key: "drapes", label: "Draperii decorative", multiplier: 1.15 },
    { key: "custom", label: "Textile la comandă", multiplier: 1.6 },
  ] },
  { room: "living", category: "Iluminat", key: "lighting", name: "Corp de iluminat / lampadar", unit: "buc.", quantityEnabled: true, defaultQty: 2, minQty: 1, maxQty: 6, low: { min: 75, max: 225 }, medium: { min: 300, max: 800 }, high: { min: 900, max: 2500 } },
  { room: "living", category: "Finisaje", key: "wall_finish", name: "Perete accent", low: { min: 300, max: 900 }, medium: { min: 1000, max: 2600 }, high: { min: 3500, max: 9000 }, options: [
    { key: "paint", label: "Vopsea decorativă", multiplier: 0.75 },
    { key: "wallpaper", label: "Tapet", multiplier: 1.1 },
    { key: "panels", label: "Panouri lemn / riflaje", multiplier: 1.65 },
    { key: "stone", label: "Piatră decorativă", multiplier: 2.1 },
  ] },
  { room: "living", category: "Decor", key: "decor", name: "Tablou / decorațiune", unit: "buc.", quantityEnabled: true, defaultQty: 4, minQty: 1, maxQty: 20, low: { min: 60, max: 160 }, medium: { min: 200, max: 500 }, high: { min: 625, max: 2000 }, options: [
    { key: "frames", label: "Tablouri / postere", multiplier: 1 },
    { key: "mirrors", label: "Oglinzi decorative", multiplier: 1.25 },
    { key: "art", label: "Artă / obiecte statement", multiplier: 1.9 },
  ] },

  { room: "kitchen", category: "Mobilier", key: "cabinets", name: "Mobilier bucătărie", low: { min: 3000, max: 6500 }, medium: { min: 8000, max: 18000 }, high: { min: 25000, max: 65000 } },
  { room: "kitchen", category: "Electrocasnice", key: "appliances", name: "Electrocasnice mari", low: { min: 2200, max: 4500 }, medium: { min: 5500, max: 11000 }, high: { min: 14000, max: 32000 } },
  { room: "kitchen", category: "Finisaje", key: "worktop", name: "Blat + chiuvetă", low: { min: 700, max: 1500 }, medium: { min: 1800, max: 4200 }, high: { min: 5500, max: 16000 } },
  { room: "kitchen", category: "Finisaje", key: "backsplash", name: "Placare perete / backsplash", low: { min: 300, max: 900 }, medium: { min: 1000, max: 2500 }, high: { min: 3000, max: 8500 }, options: [
    { key: "ceramic", label: "Gresie/faianță ceramică", multiplier: 1 },
    { key: "glass", label: "Sticlă securizată", multiplier: 1.45 },
    { key: "quartz", label: "Quartz / piatră", multiplier: 2.15 },
  ] },
  { room: "kitchen", category: "Iluminat", key: "lighting", name: "Corp iluminat blat / masă", unit: "buc.", quantityEnabled: true, defaultQty: 2, minQty: 1, maxQty: 8, low: { min: 125, max: 350 }, medium: { min: 400, max: 1100 }, high: { min: 1500, max: 3750 } },
  { room: "kitchen", category: "Mobilier", key: "stools", name: "Scaun / taburet bar", unit: "buc.", quantityEnabled: true, defaultQty: 2, minQty: 1, maxQty: 8, low: { min: 150, max: 400 }, medium: { min: 450, max: 1200 }, high: { min: 1500, max: 4000 } },
  { room: "kitchen", category: "Decor", key: "organizers", name: "Organizator / accesoriu", unit: "buc.", quantityEnabled: true, defaultQty: 4, minQty: 1, maxQty: 20, low: { min: 40, max: 115 }, medium: { min: 125, max: 325 }, high: { min: 375, max: 1000 } },

  { room: "office", category: "Mobilier", key: "desk", name: "Birou de lucru", low: { min: 350, max: 900 }, medium: { min: 1200, max: 3000 }, high: { min: 4000, max: 10000 } },
  { room: "office", category: "Mobilier", key: "chair", name: "Scaun ergonomic", low: { min: 300, max: 800 }, medium: { min: 1000, max: 2600 }, high: { min: 3500, max: 8500 }, options: [
    { key: "basic", label: "Ergonomic basic", multiplier: 0.9 },
    { key: "mesh", label: "Mesh reglabil", multiplier: 1.15 },
    { key: "premium", label: "Premium / suport lombar avansat", multiplier: 1.75 },
  ] },
  { room: "office", category: "Mobilier", key: "storage", name: "Rafturi / depozitare", low: { min: 250, max: 700 }, medium: { min: 800, max: 2200 }, high: { min: 3000, max: 8500 } },
  { room: "office", category: "Iluminat", key: "lamp", name: "Lampă de birou", unit: "buc.", quantityEnabled: true, defaultQty: 1, minQty: 1, maxQty: 4, low: { min: 100, max: 300 }, medium: { min: 400, max: 1000 }, high: { min: 1200, max: 3000 } },
  { room: "office", category: "Textile", key: "rug", name: "Covor", unit: "buc.", quantityEnabled: true, defaultQty: 1, minQty: 1, maxQty: 3, low: { min: 150, max: 400 }, medium: { min: 450, max: 1200 }, high: { min: 1400, max: 3500 } },
  { room: "office", category: "Finisaje", key: "wall_finish", name: "Perete accent / panou birou", low: { min: 200, max: 600 }, medium: { min: 700, max: 1800 }, high: { min: 2200, max: 5500 }, options: [
    { key: "paint", label: "Vopsea accent", multiplier: 0.8 },
    { key: "wallpaper", label: "Tapet", multiplier: 1.15 },
    { key: "acoustic", label: "Panouri acustice", multiplier: 1.75 },
  ] },
  { room: "office", category: "Decor", key: "decor", name: "Panou / plantă / organizator", unit: "buc.", quantityEnabled: true, defaultQty: 4, minQty: 1, maxQty: 20, low: { min: 30, max: 90 }, medium: { min: 100, max: 275 }, high: { min: 350, max: 1125 } },
];

const ESSENTIAL_KEYS = {
  bedroom: ["bed", "wardrobe", "lights"],
  living: ["sofa", "coffee", "lighting"],
  kitchen: ["cabinets", "appliances", "worktop"],
  office: ["desk", "chair", "lamp"],
};

const RECOMMENDED_KEYS = {
  bedroom: ["nightstands", "rug", "curtains"],
  living: ["tv", "shelf", "rug", "curtains"],
  kitchen: ["backsplash", "lighting", "stools"],
  office: ["storage", "rug"],
};

const PRIORITY_META = {
  essential: {
    label: "Esențial",
    action: "Cumpără acum",
    desc: "Piese de bază pentru funcționalitatea camerei.",
  },
  recommended: {
    label: "Recomandat",
    action: "Planifică în etapa doi",
    desc: "Piese care cresc confortul și coerența amenajării.",
  },
  optional: {
    label: "Opțional",
    action: "Poate fi amânat",
    desc: "Decor și accesorii care pot fi cumpărate treptat.",
  },
};

const ITEM_OPTION_OVERRIDES = {
  "bedroom:bed": [
    { key: "frame_basic", label: "Doar cadru pat simplu", multiplier: 0.55 },
    { key: "mattress_only", label: "Doar saltea", multiplier: 0.65 },
    { key: "frame_mattress", label: "Cadru + saltea", multiplier: 1 },
    { key: "upholstered", label: "Pat tapițat + saltea", multiplier: 1.28 },
    { key: "storage", label: "Pat cu ladă depozitare + saltea", multiplier: 1.45 },
    { key: "solid_wood", label: "Lemn masiv + saltea premium", multiplier: 1.85 },
  ],
  "bedroom:wardrobe": [
    { key: "pal_sliding", label: "PAL melaminat, uși glisante", multiplier: 0.9 },
    { key: "pal_hinged", label: "PAL melaminat, uși batante", multiplier: 1 },
    { key: "mdf", label: "MDF vopsit / fronturi premium", multiplier: 1.45 },
    { key: "mirror", label: "Dulap cu oglinzi", multiplier: 1.25 },
    { key: "custom", label: "Dressing la comandă", multiplier: 1.9 },
    { key: "walkin", label: "Dressing walk-in", multiplier: 2.55 },
  ],
  "bedroom:nightstands": [
    { key: "pal", label: "PAL / MDF simplu", multiplier: 1 },
    { key: "wood", label: "Lemn / furnir", multiplier: 1.45 },
    { key: "drawer", label: "Cu sertare și feronerie mai bună", multiplier: 1.25 },
    { key: "premium", label: "Design premium", multiplier: 1.9 },
  ],
  "bedroom:rug": [
    { key: "synthetic", label: "Sintetic", multiplier: 0.85 },
    { key: "jute", label: "Iută / fibre naturale", multiplier: 1.1 },
    { key: "wool", label: "Lână", multiplier: 1.75 },
    { key: "large", label: "Dimensiune mare", multiplier: 1.45 },
  ],
  "living:sofa": [
    { key: "straight_fabric", label: "Canapea simplă, stofă", multiplier: 0.9 },
    { key: "extensible", label: "Canapea extensibilă", multiplier: 1.15 },
    { key: "corner_fabric", label: "Colțar, stofă", multiplier: 1.35 },
    { key: "modular", label: "Colțar modular", multiplier: 1.6 },
    { key: "velvet", label: "Catifea / stofă premium", multiplier: 1.45 },
    { key: "leather", label: "Piele / material premium", multiplier: 1.85 },
  ],
  "living:tv": [
    { key: "pal", label: "PAL / modular", multiplier: 0.9 },
    { key: "mdf", label: "MDF / fronturi vopsite", multiplier: 1.3 },
    { key: "wood", label: "Lemn / furnir", multiplier: 1.55 },
    { key: "custom", label: "Mobilier TV la comandă", multiplier: 2 },
  ],
  "living:shelf": [
    { key: "simple", label: "Rafturi simple", multiplier: 0.85 },
    { key: "bookcase", label: "Bibliotecă modulară", multiplier: 1 },
    { key: "metal_wood", label: "Metal + lemn", multiplier: 1.25 },
    { key: "custom_wall", label: "Bibliotecă pe perete, la comandă", multiplier: 2.1 },
  ],
  "living:rug": [
    { key: "synthetic", label: "Sintetic", multiplier: 0.85 },
    { key: "flatweave", label: "Țesătură plată", multiplier: 1.05 },
    { key: "wool", label: "Lână", multiplier: 1.75 },
    { key: "large", label: "Dimensiune mare living", multiplier: 1.5 },
  ],
  "kitchen:cabinets": [
    { key: "linear_pal", label: "Bucătărie liniară, PAL", multiplier: 0.85 },
    { key: "corner_pal", label: "Bucătărie pe colț, PAL", multiplier: 1.1 },
    { key: "mdf", label: "MDF vopsit / fronturi premium", multiplier: 1.45 },
    { key: "custom", label: "Mobilier la comandă", multiplier: 1.8 },
    { key: "premium", label: "Premium cu accesorii interioare", multiplier: 2.35 },
  ],
  "kitchen:appliances": [
    { key: "basic", label: "Set basic: frigider, plită, cuptor", multiplier: 0.85 },
    { key: "standard", label: "Set complet standard", multiplier: 1 },
    { key: "built_in", label: "Electrocasnice incorporabile", multiplier: 1.35 },
    { key: "premium", label: "Branduri premium", multiplier: 1.9 },
  ],
  "kitchen:worktop": [
    { key: "laminate", label: "Blat laminat", multiplier: 0.75 },
    { key: "wood", label: "Blat lemn", multiplier: 1.2 },
    { key: "compact", label: "Compact / HPL", multiplier: 1.55 },
    { key: "quartz", label: "Quartz / piatră", multiplier: 2.35 },
  ],
  "kitchen:stools": [
    { key: "plastic", label: "Plastic / metal basic", multiplier: 0.8 },
    { key: "wood", label: "Lemn", multiplier: 1.1 },
    { key: "upholstered", label: "Tapițat", multiplier: 1.35 },
    { key: "premium", label: "Design premium", multiplier: 1.85 },
  ],
  "office:desk": [
    { key: "simple", label: "Birou simplu", multiplier: 0.85 },
    { key: "storage", label: "Birou cu depozitare", multiplier: 1.15 },
    { key: "standing", label: "Reglabil pe înălțime", multiplier: 1.65 },
    { key: "wood", label: "Lemn / blat premium", multiplier: 1.45 },
  ],
  "office:storage": [
    { key: "shelves", label: "Rafturi simple", multiplier: 0.8 },
    { key: "closed", label: "Corpuri închise", multiplier: 1.2 },
    { key: "metal", label: "Metal + lemn", multiplier: 1.25 },
    { key: "custom", label: "Depozitare la comandă", multiplier: 1.9 },
  ],
  "office:rug": [
    { key: "synthetic", label: "Sintetic", multiplier: 0.85 },
    { key: "low_pile", label: "Fir scurt pentru scaun birou", multiplier: 1 },
    { key: "wool", label: "Lână", multiplier: 1.65 },
  ],
  curtains: [
    { key: "ready_made", label: "Perdele gata făcute", multiplier: 0.75 },
    { key: "curtains", label: "Perdele simple", multiplier: 0.9 },
    { key: "drapes", label: "Perdele + draperii", multiplier: 1.25 },
    { key: "blackout", label: "Blackout", multiplier: 1.45 },
    { key: "custom", label: "Textile la comandă", multiplier: 1.75 },
  ],
  lighting: [
    { key: "basic", label: "Corp simplu", multiplier: 0.8 },
    { key: "decorative", label: "Decorativ", multiplier: 1.1 },
    { key: "dimmable", label: "Dimmable / LED integrat", multiplier: 1.35 },
    { key: "premium", label: "Design premium", multiplier: 1.85 },
  ],
  lights: [
    { key: "basic", label: "Corp simplu / veioză basic", multiplier: 0.8 },
    { key: "decorative", label: "Decorativ", multiplier: 1.1 },
    { key: "dimmable", label: "Dimmable / LED integrat", multiplier: 1.35 },
    { key: "premium", label: "Design premium", multiplier: 1.85 },
  ],
  lamp: [
    { key: "basic", label: "Lampă basic", multiplier: 0.8 },
    { key: "adjustable", label: "Braț reglabil", multiplier: 1.15 },
    { key: "led", label: "LED cu intensitate reglabilă", multiplier: 1.35 },
    { key: "premium", label: "Design premium", multiplier: 1.75 },
  ],
  wall_finish: [
    { key: "paint", label: "Vopsea lavabilă / accent color", multiplier: 0.75 },
    { key: "decorative_paint", label: "Vopsea decorativă", multiplier: 1 },
    { key: "wallpaper", label: "Tapet", multiplier: 1.2 },
    { key: "wood_panels", label: "Panouri lemn / riflaje", multiplier: 1.7 },
    { key: "acoustic", label: "Panouri acustice", multiplier: 1.85 },
    { key: "stone", label: "Piatră decorativă", multiplier: 2.15 },
  ],
  decor: [
    { key: "small", label: "Decorațiuni mici", multiplier: 0.75 },
    { key: "frames", label: "Tablouri / rame", multiplier: 1 },
    { key: "plants", label: "Plante / vaze", multiplier: 0.9 },
    { key: "mirrors", label: "Oglinzi decorative", multiplier: 1.25 },
    { key: "art", label: "Artă / obiecte statement", multiplier: 1.9 },
  ],
};

const BUDGET_TIPS = {
  low: [
    "Prioritizează piesele esențiale și cumpără decorul treptat.",
    "Caută mobilier second-hand, outlet sau piese modulare ușor de completat.",
    "Recondiționează mobilierul existent înainte să cumperi totul nou.",
    "Schimbă atmosfera cu textile: perdele, covor, huse, perne decorative.",
    "Folosește soluții DIY pentru decor, organizare și mici reparații.",
  ],
  medium: [
    "Combină piese accesibile cu una sau două piese accent.",
    "Investește în obiectele folosite zilnic: pat, canapea, scaun ergonomic.",
    "Alege materiale rezistente pentru piesele principale.",
    "Păstrează 10-15% din buget pentru transport, montaj și accesorii.",
  ],
  high: [
    "Investește în materiale durabile și piese care îmbătrânesc frumos.",
    "Ia în calcul consultarea unui designer pentru layout, cromatică și achiziții.",
    "Alege iluminat și finisaje premium, fiindcă schimbă mult atmosfera.",
    "Separă bugetul pentru mobilier de bugetul pentru montaj și personalizare.",
  ],
};

const RECOMMENDED_ARTICLES = {
  low: [
    { title: "Idei IKEA pentru amenajări accesibile", desc: "Inspirație practică pentru depozitare, decor și soluții de zi cu zi.", url: "https://www.ikea.com/ro/ro/ideas/" },
    { title: "Trucuri de decor pentru dormitor cu buget redus", desc: "Idei de textile, tapet, vopsea și mici schimbări cu impact vizual.", url: "https://www.thespruce.com/bedroom-decorating-tips-on-a-budget-11745983" },
  ],
  medium: [
    { title: "Cât costă renovarea unei locuințe", desc: "Repere de buget pentru camere, finisaje și lucrări de renovare.", url: "https://www.architecturaldigest.com/story/cost-to-renovate-a-house" },
    { title: "Materiale recomandate de designeri pentru interior", desc: "Idei pentru lemn, ceramică, textile performante, piatră și metale.", url: "https://www.thespruce.com/2024-home-material-trends-8605292" },
  ],
  high: [
    { title: "Întrebări utile înainte să angajezi un designer", desc: "Cum discuți stilul, bugetul și modul de lucru înainte de proiect.", url: "https://www.architecturaldigest.com/story/questions-to-ask-an-interior-designer-before-you-hire-them" },
    { title: "Cum se poate împărți bugetul într-un living premium", desc: "Exemplu real despre alocarea bugetului pe piese, materiale și impact.", url: "https://www.architecturaldigest.com/story/how-one-designer-spent-her-clients-40000-dollar-budget-to-revive-a-midcentury-living-room" },
  ],
};

const MATERIAL_RECOMMENDATIONS = {
  low: [
    "PAL melaminat",
    "Mobilier modular",
    "Textile accesibile",
    "Covoare sintetice",
    "Decorațiuni DIY",
    "Piese second-hand",
  ],
  medium: [
    "MDF vopsit",
    "Lemn furniruit",
    "Textile rezistente",
    "Mobilier mixt",
    "Iluminat decorativ mediu",
    "Finisaje ușor de întreținut",
  ],
  high: [
    "Lemn masiv",
    "Quartz / piatră naturală",
    "Textile premium",
    "Mobilier la comandă",
    "Iluminat premium",
    "Finisaje personalizate",
  ],
};

const SHOP_RECOMMENDATIONS = {
  low: [
    { name: "IKEA", desc: "Mobilier modular și accesorii accesibile", url: "https://www.ikea.com/ro/ro/" },
    { name: "JYSK", desc: "Textile, mobilier simplu și decorațiuni", url: "https://jysk.ro/" },
    { name: "OLX", desc: "Opțiuni second-hand și mobilier recondiționabil", url: "https://www.olx.ro/" },
  ],
  medium: [
    { name: "IKEA", desc: "Mobilier practic și soluții pentru depozitare", url: "https://www.ikea.com/ro/ro/" },
    { name: "Mobexpert", desc: "Mobilier și decorațiuni pentru buget mediu", url: "https://www.mobexpert.ro/" },
    { name: "The Home", desc: "Piese decorative și mobilier de accent", url: "https://thehome.ro/" },
  ],
  high: [
    { name: "Mobexpert", desc: "Mobilier premium și amenajări complete", url: "https://www.mobexpert.ro/" },
    { name: "The Home", desc: "Piese de design și decorațiuni premium", url: "https://thehome.ro/" },
    { name: "BoConcept", desc: "Mobilier premium și design contemporan", url: "https://www.boconcept.com/" },
  ],
};

const STYLE_MULTIPLIERS = [
  { test: "minimal", value: 0.95 },
  { test: "scandinav", value: 1 },
  { test: "industrial", value: 1.05 },
  { test: "boho", value: 1.08 },
  { test: "vintage", value: 1.1 },
  { test: "japandi", value: 1.12 },
  { test: "mediterranean", value: 1.15 },
  { test: "art deco", value: 1.3 },
  { test: "classic", value: 1.25 },
  { test: "clasic", value: 1.25 },
  { test: "baroc", value: 1.45 },
  { test: "victorian", value: 1.45 },
];

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const styleMultiplier = (title) => {
  const normalized = normalize(title);
  return STYLE_MULTIPLIERS.find((item) => normalized.includes(item.test))?.value || 1.08;
};

const getGroupedItems = (items) =>
  items.reduce((groups, item) => {
    groups[item.category] = groups[item.category] || [];
    groups[item.category].push(item);
    return groups;
  }, {});

const getItemQty = (item, quantities) => {
  if (!item.quantityEnabled) return 1;
  return quantities[item.key] || item.defaultQty || 1;
};

const getItemOptions = (item) =>
  ITEM_OPTION_OVERRIDES[`${item.room}:${item.key}`] ||
  ITEM_OPTION_OVERRIDES[item.key] ||
  item.options ||
  [];

const getItemOption = (item, optionChoices = {}) => {
  const options = getItemOptions(item);
  if (!options.length) return null;
  const selectedKey = optionChoices[item.key] || options[0].key;
  return options.find((option) => option.key === selectedKey) || options[0];
};

const getItemPriority = (item) => {
  if (ESSENTIAL_KEYS[item.room]?.includes(item.key)) return "essential";
  if (RECOMMENDED_KEYS[item.room]?.includes(item.key)) return "recommended";
  return "optional";
};

const calculateBudget = (items, budgetLevel, multiplier, area = 0, quantities = {}, optionChoices = {}) => {
  const baseBreakdown = items.map((item) => {
    const range = item[budgetLevel];
    const quantity = getItemQty(item, quantities);
    const option = getItemOption(item, optionChoices);
    const optionMultiplier = option?.multiplier || 1;
    const unitMin = Math.round(range.min * multiplier * optionMultiplier);
    const unitMax = Math.round(range.max * multiplier * optionMultiplier);
    const min = unitMin * quantity;
    const max = unitMax * quantity;
    const priority = getItemPriority(item);
    return { ...item, option, priority, quantity, unitMin, unitMax, min, max, average: Math.round((min + max) / 2) };
  });

  const areaCost = Math.round((Number(area) || 0) * AREA_COST[budgetLevel]);
  const minTotal = baseBreakdown.reduce((sum, item) => sum + item.min, 0) + areaCost;
  const maxTotal = baseBreakdown.reduce((sum, item) => sum + item.max, 0) + areaCost;
  const averageTotal = Math.round((minTotal + maxTotal) / 2);
  const breakdown = baseBreakdown.map((item) => ({
    ...item,
    share: averageTotal ? Math.round((item.average / averageTotal) * 100) : 0,
  }));

  return {
    breakdown,
    areaCost,
    minTotal,
    maxTotal,
    averageTotal,
  };
};

const buildPriorityPlan = (breakdown) =>
  Object.entries(PRIORITY_META).map(([key, meta]) => {
    const items = breakdown.filter((item) => item.priority === key);
    const total = items.reduce((sum, item) => sum + item.average, 0);
    return { key, ...meta, items, total };
  });

const buildCategorySummaries = (breakdown, averageTotal) =>
  Object.entries(getGroupedItems(breakdown)).map(([category, items]) => {
    const average = items.reduce((sum, item) => sum + item.average, 0);
    return {
      category,
      average,
      share: averageTotal ? Math.round((average / averageTotal) * 100) : 0,
    };
  });

export default function BudgetEstimatorPage() {
  const [room, setRoom] = usePersistentState("nestify:budget:room", "bedroom");
  const [area, setArea] = usePersistentState("nestify:budget:area", 12);
  const [level, setLevel] = usePersistentState("nestify:budget:level", "low");
  const [styleId, setStyleId] = usePersistentState("nestify:budget:styleId", "");
  const [styles, setStyles] = useState([]);
  const [selected, setSelected] = usePersistentState("nestify:budget:selected", {});
  const [quantities, setQuantities] = usePersistentState("nestify:budget:quantities", {});
  const [optionChoices, setOptionChoices] = usePersistentState("nestify:budget:optionChoices", {});
  const [result, setResult] = usePersistentState("nestify:budget:result", null);
  const [checklistDone, setChecklistDone] = usePersistentState("nestify:budget:checklistDone", {});

  useEffect(() => {
    api.get("/api/styles").then((res) => setStyles(res.data)).catch(() => {});
  }, []);

  const roomItems = useMemo(
    () => BUDGET_ITEMS.filter((item) => item.room === room),
    [room]
  );

  const groupedRoomItems = useMemo(() => getGroupedItems(roomItems), [roomItems]);
  const selectedItems = roomItems.filter((item) => selected[item.key]);
  const selectedStyle = styles.find((style) => String(style.id) === String(styleId));
  const selectedRoom = ROOMS.find((item) => item.key === room);
  const selectedLevel = LEVELS.find((item) => item.key === level);

  const handleRoomChange = (nextRoom) => {
    setRoom(nextRoom);
    setSelected({});
    setQuantities({});
    setOptionChoices({});
    setResult(null);
    setChecklistDone({});
  };

  const handleAreaChange = (event) => {
    setArea(Number(event.target.value));
    setResult(null);
    setChecklistDone({});
  };

  const handleLevelChange = (nextLevel) => {
    setLevel(nextLevel);
    setResult(null);
    setChecklistDone({});
  };

  const handleStyleChange = (nextStyleId) => {
    setStyleId(nextStyleId);
    setResult(null);
    setChecklistDone({});
  };

  const setItemSelected = (item, nextActive) => {
    const options = getItemOptions(item);
    setSelected((prev) => ({ ...prev, [item.key]: nextActive }));
    if (nextActive && item.quantityEnabled) {
      setQuantities((prev) => ({
        ...prev,
        [item.key]: prev[item.key] || item.defaultQty || 1,
      }));
    }
    if (nextActive && options.length) {
      setOptionChoices((prev) => ({
        ...prev,
        [item.key]: prev[item.key] || options[0].key,
      }));
    }
    setResult(null);
    setChecklistDone({});
  };

  const handleQuantityChange = (item, value) => {
    const nextValue = Number(value);
    const nextQty = Math.min(
      item.maxQty || 99,
      Math.max(item.minQty || 1, Number.isNaN(nextValue) ? item.defaultQty || 1 : nextValue)
    );
    setQuantities((prev) => ({ ...prev, [item.key]: nextQty }));
    setResult(null);
    setChecklistDone({});
  };

  const handleOptionChange = (item, value) => {
    setOptionChoices((prev) => ({ ...prev, [item.key]: value }));
    setResult(null);
    setChecklistDone({});
  };

  const selectEssentials = () => {
    const essentials = {
      bedroom: ["bed", "wardrobe", "lights"],
      living: ["sofa", "coffee", "lighting"],
      kitchen: ["cabinets", "appliances", "worktop"],
      office: ["desk", "chair", "lamp"],
    };

    setSelected(
      Object.fromEntries((essentials[room] || []).map((key) => [key, true]))
    );
    setQuantities(
      Object.fromEntries(
        roomItems
          .filter((item) => essentials[room]?.includes(item.key) && item.quantityEnabled)
          .map((item) => [item.key, item.defaultQty || 1])
      )
    );
    setResult(null);
    setChecklistDone({});
  };

  const selectAll = () => {
    setSelected(Object.fromEntries(roomItems.map((item) => [item.key, true])));
    setQuantities(
      Object.fromEntries(
        roomItems
          .filter((item) => item.quantityEnabled)
          .map((item) => [item.key, item.defaultQty || 1])
      )
    );
    setResult(null);
    setChecklistDone({});
  };

  const clearSelection = () => {
    setSelected({});
    setQuantities({});
    setOptionChoices({});
    setResult(null);
    setChecklistDone({});
  };

  const toggleChecklistItem = (itemKey) => {
    setChecklistDone((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const handleCalculate = (event) => {
    event.preventDefault();
    if (selectedItems.length === 0) {
      toast.error("Selectează cel puțin un obiect.");
      return;
    }

    const multiplier = styleMultiplier(selectedStyle?.title);
    const estimate = calculateBudget(selectedItems, level, multiplier, area, quantities, optionChoices);
    const reserve = Math.round(estimate.averageTotal * 0.12);
    const priorityPlan = buildPriorityPlan(estimate.breakdown);
    const categorySummaries = buildCategorySummaries(estimate.breakdown, estimate.averageTotal);

    setChecklistDone({});
    setResult({
      ...estimate,
      area,
      roomLabel: selectedRoom?.label,
      levelLabel: selectedLevel?.label,
      styleName: selectedStyle?.title || "Oricare",
      multiplier,
      reserve,
      finalRecommended: estimate.averageTotal + reserve,
      priorityPlan,
      categorySummaries,
      tips: BUDGET_TIPS[level],
      articles: RECOMMENDED_ARTICLES[level],
      materials: MATERIAL_RECOMMENDATIONS[level],
      shops: SHOP_RECOMMENDATIONS[level],
    });
  };

  const preview = calculateBudget(selectedItems, level, styleMultiplier(selectedStyle?.title), area, quantities, optionChoices);
  const resultGroups = result ? getGroupedItems(result.breakdown) : {};

  const handleExportPdf = () => {
    if (!result) return;

    const doc = new jsPDF();
    const margin = 14;
    let y = 18;
    const line = (text, size = 10, gap = 6) => {
      if (y > 280) {
        doc.addPage();
        y = 18;
      }
      doc.setFontSize(size);
      doc.text(String(text), margin, y);
      y += gap;
    };

    line("Nestify - estimare buget amenajare", 16, 9);
    line(`${result.roomLabel} | ${result.area} mp | buget ${result.levelLabel} | stil ${result.styleName}`, 10, 8);
    line(`Interval estimat: ${fmt(result.minTotal)} - ${fmt(result.maxTotal)}`, 12, 7);
    line(`Medie estimata: ${fmt(result.averageTotal)}`, 10);
    line(`Rezerva recomandata: ${fmt(result.reserve)}`, 10);
    line(`Buget recomandat: ${fmt(result.finalRecommended)}`, 11, 10);

    line("Impartire pe categorii", 13, 8);
    result.categorySummaries.forEach((summary) => {
      line(`${summary.category}: ${fmt(summary.average)} (${summary.share}% din total)`);
    });

    y += 3;
    line("Plan de cumparaturi", 13, 8);
    result.priorityPlan.forEach((group) => {
      if (!group.items.length) return;
      line(`${group.action} - ${group.label}: ${fmt(group.total)}`, 11, 7);
      group.items.forEach((item) => {
        const optionLabel = item.option?.label ? ` - ${item.option.label}` : "";
        line(`- ${item.name}${optionLabel}: ${fmt(item.min)} - ${fmt(item.max)} (${item.share}% din total)`, 9, 5);
      });
      y += 2;
    });

    y += 3;
    line("Nota: valorile sunt estimative si pot varia in functie de brand, transport si montaj.", 9);
    doc.save(`nestify-buget-${result.roomLabel || "camera"}.pdf`);
  };

  return (
    <div className="museum-home">
      <Navbar />

      <section style={{ padding: "64px 48px 56px", background: "var(--cream-dark)", borderBottom: "1px solid var(--card-border)" }}>
        <span className="museum-kicker">Planificare financiară</span>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.2rem,4vw,3.4rem)", marginBottom: 14 }}>
          Planificator buget amenajare
        </h1>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.85, maxWidth: 680, fontFamily: "Inter, sans-serif", fontWeight: 300 }}>
          Alege camera, nivelul de buget, stilul și obiectele pe care vrei să le cumperi. Primești o estimare orientativă pe categorii, plus recomandări practice adaptate bugetului.
        </p>
      </section>

      <main style={{ padding: "52px 48px 100px", maxWidth: 1120, margin: "0 auto" }}>
        {!result ? (
          <form onSubmit={handleCalculate} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) 340px", gap: 28, alignItems: "start" }}>
            <div style={{ display: "grid", gap: 40 }}>
              <section>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--text-muted)", marginBottom: 16 }}>
                  1. Alege camera
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                  {ROOMS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleRoomChange(item.key)}
                      style={{ padding: "20px 18px", textAlign: "left", background: room === item.key ? "var(--text)" : "var(--white)", color: room === item.key ? "var(--cream)" : "var(--text)", border: `1px solid ${room === item.key ? "var(--text)" : "var(--card-border)"}`, transition: "all 0.18s" }}
                    >
                      <span style={{ display: "block", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.2rem", marginBottom: 4 }}>{item.label}</span>
                      <span style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: "0.78rem", opacity: 0.74, lineHeight: 1.45 }}>{item.desc}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--text-muted)", marginBottom: 16 }}>
                  2. Suprafața camerei
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="number"
                    min="4"
                    max="80"
                    value={area}
                    onChange={handleAreaChange}
                    style={{ width: 180, padding: "12px 14px", border: "1px solid var(--card-border)", background: "var(--white)", color: "var(--text)", fontFamily: "Inter, sans-serif", fontSize: "0.9rem" }}
                  />
                  <span style={{ fontFamily: "Inter, sans-serif", color: "var(--text-muted)" }}>mp</span>
                </div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.65, marginTop: 10 }}>
                  Adăugăm automat costuri orientative pentru finisaje și montaj: {fmt(AREA_COST[level])}/mp.
                </p>
              </section>

              <section>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--text-muted)", marginBottom: 16 }}>
                  3. Alege nivelul de buget
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  {LEVELS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleLevelChange(item.key)}
                      style={{ padding: "20px 18px", textAlign: "left", background: level === item.key ? "var(--text)" : "var(--white)", color: level === item.key ? "var(--cream)" : "var(--text)", border: `1px solid ${level === item.key ? "var(--text)" : "var(--card-border)"}`, transition: "all 0.18s" }}
                    >
                      <span style={{ display: "block", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.2rem", marginBottom: 4 }}>{item.label}</span>
                      <span style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: "0.78rem", opacity: 0.74, lineHeight: 1.45 }}>{item.desc}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--text-muted)", marginBottom: 16 }}>
                  4. Stil preferat
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleStyleChange("")}
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", padding: "7px 16px", border: `1px solid ${!styleId ? "var(--text)" : "var(--card-border)"}`, background: !styleId ? "var(--text)" : "transparent", color: !styleId ? "var(--cream)" : "var(--text)" }}
                  >
                    Oricare
                  </button>
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => handleStyleChange(String(style.id))}
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "0.78rem", padding: "7px 16px", border: `1px solid ${String(styleId) === String(style.id) ? "var(--text)" : "var(--card-border)"}`, background: String(styleId) === String(style.id) ? "var(--text)" : "transparent", color: String(styleId) === String(style.id) ? "var(--cream)" : "var(--text)" }}
                    >
                      {style.title}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-end", marginBottom: 16 }}>
                  <div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em", color: "var(--text-muted)", marginBottom: 6 }}>
                      5. Selectează obiectele
                    </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
                      Obiectele sunt filtrate după camera aleasă și grupate pe categorii. Pentru unele piese poți alege materialul, tipul sau nivelul de personalizare, iar bugetul se ajustează automat.
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={selectEssentials}>Esențiale</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={selectAll}>Selectează tot</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={clearSelection}>Golește</button>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 22 }}>
                  {Object.entries(groupedRoomItems).map(([category, categoryItems]) => (
                    <div key={category}>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--brown)", marginBottom: 10 }}>
                        {category}
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                        {categoryItems.map((item) => {
                          const active = !!selected[item.key];
                          const range = item[level];
                          const quantity = getItemQty(item, quantities);
                          const itemOptions = getItemOptions(item);
                          return (
                            <div
                              key={item.key}
                              style={{ background: active ? "var(--cream-dark)" : "var(--white)", border: `1px solid ${active ? "var(--text)" : "var(--card-border)"}` }}
                            >
                              <label
                                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "14px 16px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer" }}
                              >
                                <span>
                                  <span style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: "0.86rem", color: "var(--text)", fontWeight: active ? 600 : 400 }}>{item.name}</span>
                                  <span style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 3 }}>
                                    {fmt(range.min)} - {fmt(range.max)}{item.unit ? ` / ${item.unit}` : ""}
                                  </span>
                                </span>
                                <input
                                  type="checkbox"
                                  checked={active}
                                  onChange={(event) => setItemSelected(item, event.target.checked)}
                                  aria-label={`Selectează ${item.name}`}
                                  style={{ width: 18, height: 18, accentColor: "var(--text)", flexShrink: 0, cursor: "pointer" }}
                                />
                              </label>
                              {active && item.quantityEnabled && (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "0 16px 14px" }}>
                                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                    Cantitate
                                  </span>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input
                                      type="number"
                                      min={item.minQty || 1}
                                      max={item.maxQty || 99}
                                      value={quantity}
                                      onChange={(event) => handleQuantityChange(item, event.target.value)}
                                      style={{ width: 70, padding: "8px 10px", border: "1px solid var(--card-border)", background: "var(--white)", color: "var(--text)", fontFamily: "Inter, sans-serif", fontSize: "0.82rem" }}
                                    />
                                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                      {item.unit}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {active && itemOptions.length > 0 && (
                                <div style={{ padding: item.quantityEnabled ? "0 16px 14px" : "0 16px 14px" }}>
                                  <label style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 6 }}>
                                    Tip / material
                                  </label>
                                  <select
                                    value={optionChoices[item.key] || itemOptions[0].key}
                                    onChange={(event) => handleOptionChange(item, event.target.value)}
                                    style={{ width: "100%", padding: "9px 10px", border: "1px solid var(--card-border)", background: "var(--white)", color: "var(--text)", fontFamily: "Inter, sans-serif", fontSize: "0.8rem" }}
                                  >
                                    {itemOptions.map((option) => (
                                      <option key={option.key} value={option.key}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside style={{ position: "sticky", top: 96, background: "var(--white)", border: "1px solid var(--card-border)", padding: 24, boxShadow: "var(--shadow-sm)" }}>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--text-muted)", marginBottom: 12 }}>
                Rezumat selecție
              </p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.5rem", marginBottom: 8 }}>
                {selectedRoom?.label} · {selectedLevel?.label}
              </h2>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 20 }}>
                Stil: {selectedStyle?.title || "Oricare"} · {area} mp · {selectedItems.length} {selectedItems.length === 1 ? "obiect" : "obiecte"} selectate
              </p>

              <div style={{ background: "var(--cream-dark)", padding: "18px 20px", marginBottom: 18 }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                  Previzualizare
                </p>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.7rem", color: "var(--text)", lineHeight: 1.1 }}>
                  {selectedItems.length ? `${fmt(preview.minTotal)} - ${fmt(preview.maxTotal)}` : "Alege obiecte"}
                </p>
                {selectedItems.length > 0 && (
                  <>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 8 }}>
                      Medie estimată: {fmt(preview.averageTotal)}
                    </p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 6 }}>
                      Include finisaje/montaj: {fmt(preview.areaCost)}
                    </p>
                  </>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={selectedItems.length === 0} style={{ width: "100%", justifyContent: "center" }}>
                Calculează bugetul
              </button>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.65, marginTop: 14 }}>
                Estimările sunt orientative și pot varia în funcție de brand, transport, montaj și disponibilitate.
                Intervalele folosesc repere de retail din România pentru produse accesibile, medii și premium.
              </p>
            </aside>
          </form>
        ) : (
          <div style={{ display: "grid", gap: 30 }}>
            <section style={{ background: "var(--text)", color: "var(--cream)", padding: "44px 48px", textAlign: "center" }}>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", opacity: 0.68, display: "block", marginBottom: 14 }}>
                Estimare totală
              </span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.4rem,6vw,4rem)", color: "var(--cream)", lineHeight: 1, marginBottom: 12 }}>
                {fmt(result.minTotal)} - {fmt(result.maxTotal)}
              </h2>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.9rem", opacity: 0.72, marginBottom: 6 }}>
                Estimare medie: {fmt(result.averageTotal)}
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.9rem", opacity: 0.72, marginBottom: 6 }}>
                Rezervă recomandată: {fmt(result.reserve)}
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.95rem", opacity: 0.9, fontWeight: 600, marginBottom: 8 }}>
                Buget recomandat cu rezervă: {fmt(result.finalRecommended)}
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.84rem", opacity: 0.62 }}>
                {result.roomLabel} · {result.area} mp · buget {result.levelLabel} · stil {result.styleName}
              </p>
            </section>

            <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <div style={{ background: "var(--white)", border: "1px solid var(--card-border)", padding: "20px 22px" }}>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                  Finisaje și montaj
                </p>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.45rem", color: "var(--text)" }}>
                  {fmt(result.areaCost)}
                </p>
              </div>
              {Object.entries(resultGroups).map(([category, items]) => {
                const min = items.reduce((sum, item) => sum + item.min, 0);
                const max = items.reduce((sum, item) => sum + item.max, 0);
                return (
                  <div key={category} style={{ background: "var(--white)", border: "1px solid var(--card-border)", padding: "20px 22px" }}>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
                      {category}
                    </p>
                    <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.45rem", color: "var(--text)" }}>
                      {fmt(min)} - {fmt(max)}
                    </p>
                  </div>
                );
              })}
            </section>

            <section>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
                Împărțire procentuală pe categorii
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                {result.categorySummaries.map((summary) => (
                  <div key={summary.category} style={{ background: "var(--white)", border: "1px solid var(--card-border)", padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", marginBottom: 10 }}>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.1rem", margin: 0 }}>{summary.category}</h3>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "var(--brown)" }}>{summary.share}%</span>
                    </div>
                    <div style={{ height: 8, background: "var(--cream-dark)", border: "1px solid var(--card-border)", overflow: "hidden", marginBottom: 10 }}>
                      <div style={{ width: `${Math.min(summary.share, 100)}%`, height: "100%", background: "var(--text)" }} />
                    </div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      Medie estimată: {fmt(summary.average)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
                Checklist de cumpărături
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
                {result.priorityPlan.map((group) => (
                  <div key={group.key} style={{ background: "var(--white)", border: "1px solid var(--card-border)", padding: "20px 22px" }}>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.64rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--brown)", display: "block", marginBottom: 8 }}>
                      {group.action}
                    </span>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.25rem", marginBottom: 6 }}>{group.label}</h3>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 14 }}>{group.desc}</p>
                    {group.items.length ? (
                      <div style={{ display: "grid", gap: 9 }}>
                        {group.items.map((item) => {
                          const done = !!checklistDone[item.key];
                          return (
                          <label key={item.key} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 9, alignItems: "start", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={done}
                              onChange={() => toggleChecklistItem(item.key)}
                              aria-label={`MarcheazÄƒ ${item.name} ca rezolvat`}
                              style={{ width: 16, height: 16, accentColor: "var(--text)", marginTop: 2, cursor: "pointer" }}
                            />
                            <span>
                              <span style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: "0.84rem", color: done ? "var(--text-muted)" : "var(--text)", textDecoration: done ? "line-through" : "none" }}>{item.name}</span>
                              <span style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2, textDecoration: done ? "line-through" : "none" }}>
                                {item.option?.label ? `${item.option.label} · ` : ""}{fmt(item.min)} - {fmt(item.max)} · {item.share}% din total
                              </span>
                            </span>
                          </label>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)" }}>Nu ai selectat obiecte în această etapă.</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
                Detaliu pe obiecte și categorii
              </p>
              <div style={{ display: "grid", gap: 18 }}>
                {Object.entries(resultGroups).map(([category, items]) => (
                  <div key={category} style={{ border: "1px solid var(--card-border)", background: "var(--white)" }}>
                    <div style={{ padding: "14px 18px", background: "var(--cream-dark)", borderBottom: "1px solid var(--card-border)" }}>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.15rem", margin: 0 }}>{category}</h3>
                    </div>
                    {items.map((item, index) => (
                      <div key={item.key} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, padding: "14px 18px", borderBottom: index < items.length - 1 ? "1px solid var(--card-border)" : "none" }}>
                        <span>
                          <span style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: "0.9rem", color: "var(--text)" }}>{item.name}</span>
                          <span style={{ display: "inline-flex", marginTop: 5, padding: "3px 8px", border: "1px solid var(--card-border)", background: "var(--cream-dark)", fontFamily: "Inter, sans-serif", fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                            {PRIORITY_META[item.priority]?.label} · {item.share}% din total
                          </span>
                          {item.quantityEnabled && (
                            <span style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 3 }}>
                              {item.quantity} {item.unit} · {fmt(item.unitMin)} - {fmt(item.unitMax)} / {item.unit}
                            </span>
                          )}
                          {item.option?.label && (
                            <span style={{ display: "block", fontFamily: "Inter, sans-serif", fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 3 }}>
                              Tip ales: {item.option.label}
                            </span>
                          )}
                        </span>
                        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1rem", color: "var(--text)", whiteSpace: "nowrap" }}>{fmt(item.min)} - {fmt(item.max)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>

            <section style={{ background: "var(--cream-dark)", padding: "28px 30px", borderLeft: "3px solid var(--text)" }}>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
                Recomandări pentru buget {result.levelLabel}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                {result.tips.map((tip) => (
                  <div key={tip} style={{ background: "var(--white)", border: "1px solid var(--card-border)", padding: "14px 16px" }}>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.86rem", color: "var(--text)", lineHeight: 1.65 }}>{tip}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
                Materiale potrivite pentru buget
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {result.materials.map((material) => (
                  <span key={material} style={{ display: "inline-flex", padding: "9px 14px", background: "var(--white)", border: "1px solid var(--card-border)", fontFamily: "Inter, sans-serif", fontSize: "0.8rem", color: "var(--text)" }}>
                    {material}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
                Magazine și site-uri utile
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                {result.shops.map((shop) => (
                  <a key={shop.name} href={shop.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textDecoration: "none", color: "inherit", background: "var(--white)", border: "1px solid var(--card-border)", padding: "18px 20px" }}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.15rem", marginBottom: 8 }}>{shop.name}</h3>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{shop.desc}</p>
                  </a>
                ))}
              </div>
            </section>

            <section>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 16 }}>
                Articole utile pentru etapa următoare
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
                {result.articles.map((article) => (
                  <a key={article.title} href={article.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textDecoration: "none", color: "inherit", background: "var(--white)", border: "1px solid var(--card-border)", padding: "20px 22px" }}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.15rem", marginBottom: 8 }}>{article.title}</h3>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 12 }}>{article.desc}</p>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--brown)" }}>
                      Citește mai mult
                    </span>
                  </a>
                ))}
              </div>
            </section>

            <section style={{ background: "var(--cream-dark)", padding: "18px 22px", borderLeft: "3px solid var(--card-border)" }}>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.8, fontWeight: 300 }}>
                Valorile sunt estimative și se bazează pe intervale orientative pentru piața românească. Adaugă o rezervă de 10-15% pentru transport, montaj, mici accesorii sau schimbări de ultim moment.
              </p>
            </section>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={handleExportPdf}>Descarcă PDF</button>
              <button className="btn btn-primary" onClick={() => setResult(null)}>Modifică selecția</button>
              <button className="btn btn-ghost" onClick={() => { setResult(null); clearSelection(); }}>Calculează din nou</button>
              <Link to="/moodboards" className="btn btn-ghost">Creează moodboard</Link>
              <Link to="/quiz" className="btn btn-ghost">Style Quiz</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
