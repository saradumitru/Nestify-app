const prisma = require('../config/prisma');

const COLOR_OPTIONS = [
  'Albastru',
  'Naturale',
  'Alb',
  'Auriu',
  'Bej',
  'Bleumarin',
  'Burgundy',
  'Crem',
  'Gri',
  'Maro',
  'Negru',
  'Roz prăfuit',
  'Taupe',
  'Terracotta',
  'Olive',
  'Verde salvie',
];

const MATERIAL_OPTIONS = [
  'Lemn',
  'Bambus',
  'Bumbac',
  'Catifea',
  'Ceramică',
  'Sticlă',
  'Marmură',
  'Metal',
  'Ratan',
  'Piele',
  'In',
  'Lână',
  'Piatră',
  'Beton',
];

const COLOR_ALIASES = {
  Albastru: ['albastru', 'turcoaz', 'cobalt'],
  Naturale: ['natural', 'naturale', 'pamantii', 'pamantesti', 'nisipiu', 'nisip', 'ivory', 'greige', 'grej'],
  Alb: ['alb', 'white', 'ivory'],
  Auriu: ['auriu', 'aurire', 'gold', 'bronz', 'alama', 'metalic'],
  Bej: ['bej', 'beige', 'nisipiu'],
  Bleumarin: ['bleumarin', 'navy', 'albastru regal'],
  Burgundy: ['burgundy', 'visiniu', 'bordo'],
  Crem: ['crem', 'cream', 'ivory', 'alb crem'],
  Gri: ['gri', 'gray', 'grey', 'greige', 'grej'],
  Maro: ['maro', 'brun', 'brown', 'caramiziu'],
  Negru: ['negru', 'black'],
  'Roz prăfuit': ['roz prafuit', 'roz pudrat', 'dusty rose', 'mov prafuit'],
  Taupe: ['taupe'],
  Terracotta: ['terracotta', 'teracota', 'caramiziu'],
  Olive: ['olive', 'oliv', 'verde olive'],
  'Verde salvie': ['verde salvie', 'salvie', 'verde', 'verde pal'],
};

const MATERIAL_ALIASES = {
  Lemn: ['lemn', 'wood', 'brut', 'curbat', 'nobil', 'sculptat', 'masiv'],
  Bambus: ['bambus', 'bamboo'],
  Bumbac: ['bumbac', 'cotton'],
  Catifea: ['catifea', 'velvet'],
  Ceramică: ['ceramica', 'ceramic', 'lut'],
  Sticlă: ['sticla', 'cristal', 'vitra', 'glass'],
  Marmură: ['marmura', 'marble'],
  Metal: ['metal', 'otel', 'alama', 'fier', 'bronz'],
  Ratan: ['ratan', 'macrame', 'wicker'],
  Piele: ['piele', 'leather'],
  In: ['in', 'linen'],
  Lână: ['lana', 'wool'],
  Piatră: ['piatra', 'stone'],
  Beton: ['beton', 'concrete'],
};

const normalize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  return Object.values(value);
};

const matchesFacet = (values, selected, aliasMap) => {
  if (!selected) return true;

  const selectedNorm = normalize(selected);
  const canonicalKey = Object.keys(aliasMap).find((key) => normalize(key) === selectedNorm);
  const needles = [selectedNorm, ...(canonicalKey ? aliasMap[canonicalKey].map(normalize) : [])];
  const haystack = toArray(values).map(normalize).join(' ');

  return needles.some((needle) => haystack.includes(needle));
};

const searchAll = async (req, res) => {
  try {
    const query   = req.query.q?.trim()        || '';
    const color   = req.query.color?.trim()    || '';
    const material = req.query.material?.trim() || '';
    const styleId  = req.query.styleId          ? parseInt(req.query.styleId) : null;

    const hasFilters = query || color || material || styleId;

    if (!hasFilters) {
      return res.json({ styles: [], interiors: [] });
    }

    /* ── Build Style WHERE ───────────────────────────────────── */
    const styleWhere = { AND: [] };

    if (query) {
      styleWhere.AND.push({
        OR: [
          { title:       { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { kicker:      { contains: query, mode: 'insensitive' } },
          { name:        { contains: query, mode: 'insensitive' } },
        ],
      });
    }

    if (styleId) {
      styleWhere.AND.push({ id: styleId });
    }

    const styles = await prisma.style.findMany({
      where: styleWhere.AND.length ? styleWhere : {},
      take: 20,
      include: { images: { take: 1 } },
    });

    /* Color / material filters are applied in-memory on JSON arrays */
    const filteredStyles = styles.filter(s => {
      if (!matchesFacet(s.colors, color, COLOR_ALIASES)) return false;
      if (!matchesFacet(s.materials, material, MATERIAL_ALIASES)) return false;
      return true;
    });

    /* ── Build Interior WHERE ─────────────────────────────────── */
    const interiorWhere = { AND: [] };

    if (query) {
      interiorWhere.AND.push({
        OR: [
          { title:       { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { subtitle:    { contains: query, mode: 'insensitive' } },
        ],
      });
    }

    if (styleId) {
      interiorWhere.AND.push({ styleId });
    }

    const interiors = await prisma.interiorImage.findMany({
      where: interiorWhere.AND.length ? interiorWhere : {},
      include: {
        style: {
          select: { id: true, slug: true, title: true, kicker: true, colors: true, materials: true },
        },
      },
      take: 30,
    });

    /* Color / material filter through parent style */
    const filteredInteriors = interiors.filter(img => {
      if (!color && !material) return true;
      if (!matchesFacet(img.style?.colors, color, COLOR_ALIASES)) return false;
      if (!matchesFacet(img.style?.materials, material, MATERIAL_ALIASES)) return false;
      return true;
    });

    res.json({
      styles:   filteredStyles,
      interiors: filteredInteriors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la căutare.' });
  }
};

/* Return all distinct colors & materials for filter suggestions */
const getFilterOptions = async (req, res) => {
  try {
    res.json({
      colors: COLOR_OPTIONS,
      materials: MATERIAL_OPTIONS,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la filtre.' });
  }
};

module.exports = { searchAll, getFilterOptions };
