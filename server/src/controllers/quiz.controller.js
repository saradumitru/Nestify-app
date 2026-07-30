const prisma = require("../config/prisma");

const QUESTION_WEIGHTS = {
  atmosphere: 4,
  material: 3,
  color: 3,
  complexity: 2,
  budget: 2,
  room: 2,
};

const ANSWER_LABELS = {
  color: {
    bej: "paleta calda de bej si crem",
    alb: "paleta luminoasa de alb si gri deschis",
    verde: "tonurile naturale de verde",
    burgundy: "accentele burgundy si aurii",
    terracotta: "paleta terracotta si roz prafuit",
  },
  material: {
    lemn: "lemnul natural",
    catifea: "catifeaua si marmura",
    ratan: "ratanul si macrame-ul",
    in: "textilele naturale precum inul, bumbacul si lana",
    bambus: "bambusul si ceramica",
  },
  atmosphere: {
    calm: "o atmosfera calma si aerisita",
    minimalism: "o atmosfera minimalista si precisa",
    eclectic: "o atmosfera eclectica si creativa",
    luxos: "o atmosfera eleganta si luxoasa",
    natural: "o atmosfera naturala si relaxata",
  },
  complexity: {
    minimal: "decorul minimal",
    mediu: "decorul echilibrat",
    decorativ: "decorul bogat si expresiv",
  },
  budget: {
    low: "un buget accesibil",
    medium: "un buget mediu",
    premium: "o investitie premium",
  },
  room: {
    living: "amenajarea unui living",
    bedroom: "amenajarea unui dormitor",
    kitchen: "amenajarea unei bucatarii",
    office: "amenajarea unui birou",
  },
};

const ANSWER_SYNONYMS = {
  color: {
    bej: ["bej", "crem", "cream", "ivory", "taupe", "gri cald", "neutru", "neutral"],
    alb: ["alb", "gri deschis", "luminos", "aerisit", "white", "light gray"],
    verde: ["verde", "salvie", "olive", "botanic", "natural", "plante"],
    burgundy: ["burgundy", "visiniu", "auriu", "gold", "negru", "bleumarin", "dramatic"],
    terracotta: ["terracotta", "teracota", "roz prafuit", "maro cald", "caramiziu", "vintage"],
  },
  material: {
    lemn: ["lemn", "wood", "stejar", "natural"],
    catifea: ["catifea", "marmura", "alama", "sticla fumurie", "velvet", "marble", "brass"],
    ratan: ["ratan", "macrame", "tesute", "wicker", "artizanal", "boem"],
    in: ["in", "bumbac", "lana", "textile", "linen", "cotton", "wool"],
    bambus: ["bambus", "ceramica", "hartie", "zen", "bamboo"],
  },
  atmosphere: {
    calm: ["calm", "liniste", "relaxat", "aerisit", "lumina", "echilibru"],
    minimalism: ["minimalism", "minimalist", "simplu", "precis", "functional", "curat", "wabi-sabi"],
    eclectic: ["eclectic", "creativ", "artistic", "boem", "mix", "expresiv", "personal"],
    luxos: ["luxos", "elegant", "sofisticat", "glam", "teatral", "rafinat", "dramatic"],
    natural: ["natural", "organic", "botanic", "relaxat", "natura", "texturi naturale"],
  },
  complexity: {
    minimal: ["minimal", "simplu", "curat", "aerisit", "functional"],
    mediu: ["echilibrat", "calm", "select", "armonios"],
    decorativ: ["decorativ", "bogat", "eclectic", "maximal", "ornamental", "teatral"],
  },
  budget: {
    low: ["accesibil", "diy", "functional", "simplu", "second-hand"],
    medium: ["mediu", "mix", "calitate", "contemporan", "echilibrat"],
    premium: ["premium", "luxos", "marmura", "alama", "catifea", "investitie", "rafinat"],
  },
  room: {
    living: ["living", "sufragerie", "camera de zi", "relaxare"],
    bedroom: ["bedroom", "dormitor", "sanctuar", "odihna"],
    kitchen: ["kitchen", "bucatarie", "dining", "masa"],
    office: ["office", "birou", "productivitate", "studio"],
  },
};

const STYLE_PROFILES = {
  scandinavian: {
    color: ["bej", "alb", "verde"],
    material: ["lemn", "in"],
    atmosphere: ["calm", "natural", "minimalism"],
    complexity: ["minimal", "mediu"],
    budget: ["low", "medium"],
    room: ["living", "bedroom", "office"],
  },
  japandi: {
    color: ["bej", "verde", "alb"],
    material: ["bambus", "lemn", "in"],
    atmosphere: ["calm", "minimalism", "natural"],
    complexity: ["minimal", "mediu"],
    budget: ["medium", "premium"],
    room: ["bedroom", "living", "office"],
  },
  boho: {
    color: ["terracotta", "verde", "bej"],
    material: ["ratan", "lemn", "in"],
    atmosphere: ["eclectic", "natural"],
    complexity: ["decorativ", "mediu"],
    budget: ["low", "medium"],
    room: ["living", "bedroom"],
  },
  "art-deco": {
    color: ["burgundy", "bej"],
    material: ["catifea"],
    atmosphere: ["luxos", "eclectic"],
    complexity: ["decorativ"],
    budget: ["premium"],
    room: ["living", "bedroom"],
  },
  minimalist: {
    color: ["alb", "bej"],
    material: ["lemn", "in", "bambus"],
    atmosphere: ["minimalism", "calm"],
    complexity: ["minimal"],
    budget: ["medium", "premium"],
    room: ["living", "bedroom", "office", "kitchen"],
  },
  industrial: {
    color: ["burgundy", "alb"],
    material: ["lemn", "catifea"],
    atmosphere: ["eclectic", "minimalism"],
    complexity: ["mediu"],
    budget: ["medium", "premium"],
    room: ["living", "kitchen", "office"],
  },
  classic: {
    color: ["bej", "burgundy"],
    material: ["catifea", "lemn"],
    atmosphere: ["luxos", "calm"],
    complexity: ["decorativ", "mediu"],
    budget: ["premium"],
    room: ["living", "bedroom"],
  },
  clasic: {
    color: ["bej", "burgundy"],
    material: ["catifea", "lemn"],
    atmosphere: ["luxos", "calm"],
    complexity: ["decorativ", "mediu"],
    budget: ["premium"],
    room: ["living", "bedroom"],
  },
  vintage: {
    color: ["terracotta", "burgundy", "bej"],
    material: ["lemn", "catifea", "ratan"],
    atmosphere: ["eclectic", "luxos", "natural"],
    complexity: ["decorativ", "mediu"],
    budget: ["low", "medium"],
    room: ["living", "bedroom", "kitchen"],
  },
  modern: {
    color: ["alb", "bej", "burgundy"],
    material: ["lemn", "catifea"],
    atmosphere: ["minimalism", "luxos", "calm"],
    complexity: ["minimal", "mediu"],
    budget: ["medium", "premium"],
    room: ["living", "kitchen", "office", "bedroom"],
  },
  mediterranean: {
    color: ["terracotta", "bej", "verde"],
    material: ["lemn", "ratan"],
    atmosphere: ["natural", "calm"],
    complexity: ["mediu", "decorativ"],
    budget: ["medium", "premium"],
    room: ["living", "kitchen", "bedroom"],
  },
};

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  return Object.values(value);
};

const addAll = (set, values = []) => {
  values.forEach((value) => {
    if (value) set.add(value);
  });
};

const getProfileForStyle = (style) => {
  const candidates = [style.slug, style.name, style.title]
    .map(normalize)
    .filter(Boolean);

  for (const candidate of candidates) {
    if (STYLE_PROFILES[candidate]) return STYLE_PROFILES[candidate];
    const partial = Object.keys(STYLE_PROFILES).find((key) => candidate.includes(key));
    if (partial) return STYLE_PROFILES[partial];
  }

  return null;
};

const buildSearchText = (style) =>
  normalize([
    style.title,
    style.name,
    style.slug,
    style.kicker,
    style.description,
    style.history,
    style.period,
    style.audience,
    style.category?.name,
    ...toArray(style.colors),
    ...toArray(style.materials),
    ...(style.images || []).flatMap((image) => [image.title, image.subtitle, image.description, image.roomType]),
  ].join(" "));

const inferSignalsFromStyle = (style) => {
  const signals = Object.fromEntries(
    Object.keys(QUESTION_WEIGHTS).map((key) => [key, new Set()])
  );

  const profile = getProfileForStyle(style);
  if (profile) {
    Object.entries(profile).forEach(([key, values]) => addAll(signals[key], values));
  }

  const text = buildSearchText(style);
  Object.entries(ANSWER_SYNONYMS).forEach(([questionKey, answers]) => {
    Object.entries(answers).forEach(([answerValue, terms]) => {
      if (terms.some((term) => text.includes(normalize(term)))) {
        signals[questionKey].add(answerValue);
      }
    });
  });

  return signals;
};

const buildReason = (questionKey, answerValue) => {
  const label = ANSWER_LABELS[questionKey]?.[answerValue] || answerValue;

  const templates = {
    atmosphere: `Se potriveste cu preferinta ta pentru ${label}.`,
    material: `Include sau sustine bine ${label}.`,
    color: `Se armonizeaza cu ${label}.`,
    complexity: `Are nivelul de decor apropiat de ${label}.`,
    budget: `Este realist pentru ${label}.`,
    room: `Functioneaza bine pentru ${label}.`,
  };

  return templates[questionKey] || `Se potriveste cu ${label}.`;
};

const scoreStyle = (style, answers) => {
  const signals = inferSignalsFromStyle(style);
  const text = buildSearchText(style);
  let rawScore = 0;
  let maxScore = 0;
  const matched = [];
  const breakdown = {};

  Object.entries(answers).forEach(([questionKey, rawAnswer]) => {
    const answer = normalize(rawAnswer);
    const weight = QUESTION_WEIGHTS[questionKey];
    if (!answer || !weight) return;

    maxScore += weight;
    let points = 0;
    let matchType = null;

    if (signals[questionKey]?.has(answer)) {
      points = weight;
      matchType = "profile";
    } else {
      const terms = ANSWER_SYNONYMS[questionKey]?.[answer] || [answer];
      const foundTerms = terms.filter((term) => text.includes(normalize(term)));
      if (foundTerms.length > 0) {
        points = Math.max(1, Math.round(weight * 0.65));
        matchType = "text";
      }
    }

    if (points > 0) {
      rawScore += points;
      matched.push({
        questionKey,
        answer,
        points,
        weight,
        reason: buildReason(questionKey, answer),
        matchType,
      });
    }

    breakdown[questionKey] = {
      answer,
      points,
      max: weight,
      matched: points > 0,
      matchType,
    };
  });

  const matchPercentage = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

  return {
    style,
    rawScore,
    maxScore,
    matchPercentage,
    matched,
    breakdown,
  };
};

const pickReasons = (matched) =>
  matched
    .sort((a, b) => b.points - a.points)
    .slice(0, 4)
    .map((item) => item.reason);

const calculateRecommendation = async (answers) => {
  const styles = await prisma.style.findMany({
    include: {
      category: true,
      images: {
        select: {
          title: true,
          subtitle: true,
          description: true,
          roomType: true,
        },
      },
    },
  });

  if (styles.length === 0) {
    return {
      recommendedStyleId: null,
      score: {},
      matchPercentage: 0,
      secondaryStyles: [],
      reasons: [],
    };
  }

  const scored = styles
    .map((style) => scoreStyle(style, answers))
    .sort((a, b) => {
      if (b.rawScore !== a.rawScore) return b.rawScore - a.rawScore;
      if (b.matchPercentage !== a.matchPercentage) return b.matchPercentage - a.matchPercentage;
      return a.style.id - b.style.id;
    });

  const best = scored[0];
  const byStyle = Object.fromEntries(
    scored.map((item) => [
      item.style.id,
      {
        rawScore: item.rawScore,
        maxScore: item.maxScore,
        matchPercentage: item.matchPercentage,
        matchedCriteria: item.matched.map(({ questionKey, answer, points, weight, matchType }) => ({
          questionKey,
          answer,
          points,
          weight,
          matchType,
        })),
        breakdown: item.breakdown,
      },
    ])
  );

  return {
    recommendedStyleId: best?.style?.id ?? null,
    score: {
      byStyle,
      bestStyleId: best?.style?.id ?? null,
      algorithm: "criteria-weighted-v2",
      weights: QUESTION_WEIGHTS,
    },
    matchPercentage: best?.matchPercentage ?? 0,
    secondaryStyles: scored.slice(1, 4).map((item) => ({
      id: item.style.id,
      title: item.style.title || item.style.name,
      slug: item.style.slug,
      imageUrl: item.style.imageUrl,
      matchPercentage: item.matchPercentage,
    })),
    reasons: pickReasons(best?.matched || []),
  };
};

const saveQuizResult = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return res.status(400).json({ message: "Raspunsurile sunt obligatorii." });
    }

    const recommendation = await calculateRecommendation(answers);

    const result = await prisma.quizResult.create({
      data: {
        userId: req.user.id,
        answers,
        score: recommendation.score,
        recommendedStyleId: recommendation.recommendedStyleId,
      },
      include: {
        recommendedStyle: true,
      },
    });

    res.status(201).json({
      ...result,
      matchPercentage: recommendation.matchPercentage,
      secondaryStyles: recommendation.secondaryStyles,
      reasons: recommendation.reasons,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la salvarea rezultatului quizului." });
  }
};

const getQuizResults = async (req, res) => {
  try {
    const results = await prisma.quizResult.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        recommendedStyle: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la preluarea rezultatelor quizului." });
  }
};

module.exports = {
  saveQuizResult,
  getQuizResults,
};
