const prisma = require("../config/prisma");
const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const CATALOG = require("../data/product-catalog.json");

const normalize = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const extractKeywords = (prompt) => {
  const stopWords = [
    "vreau", "un", "o", "si", "cu", "de", "la", "in", "pentru",
    "care", "este", "mai", "foarte", "camera", "amenajare",
    "design", "interior", "as", "vrea", "are", "sau", "dar",
    "the", "and", "with", "has", "that", "this",
  ];
  return normalize(prompt)
    .split(/\s+/)
    .map((w) => w.replace(/[^\w-]/g, ""))
    .filter((w) => w.length > 2 && !stopWords.includes(w));
};

const scoreStylesFromText = (styles, text) => {
  const keywords = extractKeywords(text);
  const norm = normalize(text);

  return styles.map((style) => {
    const searchable = normalize(
      [
        style.name, style.title, style.kicker, style.description,
        style.history, style.period, style.audience,
        style.category?.name,
        JSON.stringify(style.colors),
        JSON.stringify(style.materials),
      ].join(" ")
    );

    let score = 0;
    const matched = [];

    keywords.forEach((kw) => {
      if (searchable.includes(kw)) { score += 3; matched.push(kw); }
    });

    (Array.isArray(style.colors) ? style.colors : []).forEach((c) => {
      if (norm.includes(normalize(c))) { score += 4; matched.push(c); }
    });

    (Array.isArray(style.materials) ? style.materials : []).forEach((m) => {
      if (norm.includes(normalize(m))) { score += 4; matched.push(m); }
    });

    if (norm.includes(normalize(style.title))) { score += 8; matched.push(style.title); }

    return { ...style, assistantScore: score, matchedKeywords: [...new Set(matched)] };
  });
};

// Find catalog products matching detected object names
const matchCatalogProducts = (detectedObjects) => {
  if (!detectedObjects?.length) return [];
  const results = [];
  const seen = new Set();

  detectedObjects.forEach((obj) => {
    const objNorm = normalize(obj);
    CATALOG.forEach((entry) => {
      if (seen.has(entry.name)) return;
      const matches = entry.keywords.some(
        (kw) => objNorm.includes(normalize(kw)) || normalize(kw).includes(objNorm)
      );
      if (matches) {
        seen.add(entry.name);
        results.push({
          name: entry.name,
          category: entry.category,
          detectedAs: obj,
          links: entry.links,
          source: "catalog",
        });
      }
    });
  });

  return results.slice(0, 6);
};

// Find DB objects (ImageObject with productLinks) matching detected objects
const matchDbProducts = async (detectedObjects) => {
  if (!detectedObjects?.length) return [];

  const dbObjects = await prisma.imageObject.findMany({
    where: { productLinks: { some: {} } },
    include: { productLinks: true },
    take: 100,
  });

  const results = [];
  const seen = new Set();

  detectedObjects.forEach((obj) => {
    const objNorm = normalize(obj);
    dbObjects.forEach((dbObj) => {
      if (seen.has(dbObj.id)) return;
      const nameNorm = normalize(dbObj.name);
      if (
        objNorm.includes(nameNorm) ||
        nameNorm.includes(objNorm) ||
        nameNorm.split(" ").some((w) => w.length > 3 && objNorm.includes(w))
      ) {
        seen.add(dbObj.id);
        results.push({
          name: dbObj.name,
          category: "Din aplicație",
          detectedAs: obj,
          imageUrl: dbObj.imageUrl,
          links: dbObj.productLinks.map((l) => ({
            store: l.store || "Shop",
            url: l.url,
            label: l.title || l.store || "Cumpără",
            price: l.price,
          })),
          source: "db",
        });
      }
    });
  });

  return results.slice(0, 4);
};

// Claude Vision: analyze image for style + objects + recommendations
const analyzeWithClaude = async (imageBase64, mimeType, hint, appStyles) => {
  const styleList = appStyles.map((s) => s.title).join(", ");

  const systemPrompt = `Ești un expert în design interior. Analizezi imagini și ajuți utilizatorii să identifice stilul camerei și obiectele din ea.
Răspunzi EXCLUSIV în format JSON valid, fără niciun text în afara JSON-ului, fără markdown.`;

  const userContent = [];

  if (imageBase64) {
    userContent.push({
      type: "image",
      source: { type: "base64", media_type: mimeType, data: imageBase64 },
    });
  }

  const descPart = hint
    ? `Analizează imaginea și ține cont de descrierea utilizatorului: "${hint}".`
    : "Analizează imaginea de design interior.";

  userContent.push({
    type: "text",
    text: `${descPart}

Stilurile disponibile în aplicație: ${styleList}

Returnează un JSON cu această structură exactă:
{
  "primaryStyle": "stilul dominant (alege din lista de mai sus sau cel mai apropiat)",
  "secondaryStyle": "al doilea stil sau null",
  "confidence": "înalt/mediu/scăzut",
  "roomType": "dormitor/living/bucătărie/baie/birou/hol/altele",
  "detectedObjects": ["obiect1 în română", "obiect2", "obiect3", "obiect4", "obiect5"],
  "colors": ["culoare1", "culoare2", "culoare3"],
  "materials": ["material1", "material2", "material3"],
  "summary": "2-3 propoziții despre stilul și atmosfera camerei în română",
  "recommendation": "sfat concret despre ce ar putea îmbunătăți sau adăuga în cameră (1-2 propoziții în română)"
}

Pentru detectedObjects: listează mobila și obiectele de decor vizibile (ex: canapea, covor, lampă suspendată, oglindă, tablou, plantă, noptieră etc.) - maxim 8 obiecte.`,
  });

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
  });

  const raw = response.content[0].text.trim();
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  return JSON.parse(jsonStr);
};

const getDesignAssistantSuggestions = async (req, res) => {
  try {
    const hint = (req.body.prompt || req.body.hint || "").trim();
    const imageFile = req.file;
    const hasApiKey =
      process.env.ANTHROPIC_API_KEY &&
      !process.env.ANTHROPIC_API_KEY.includes("pune-cheia");

    const styles = await prisma.style.findMany({
      include: {
        category: true,
        images: { include: { objects: { include: { productLinks: true } } } },
      },
    });

    let claudeAnalysis = null;
    let detectionText = hint;
    let matchedProducts = [];
    const hadImage = !!imageFile;

    // ── Claude Vision path ──────────────────────────────────────────────────
    if (imageFile && hasApiKey) {
      try {
        const imageData = fs.readFileSync(imageFile.path);
        const base64 = imageData.toString("base64");
        claudeAnalysis = await analyzeWithClaude(base64, imageFile.mimetype, hint, styles);

        detectionText = [
          claudeAnalysis.primaryStyle,
          claudeAnalysis.secondaryStyle,
          ...(claudeAnalysis.detectedObjects || []),
          ...(claudeAnalysis.colors || []),
          ...(claudeAnalysis.materials || []),
          hint,
        ].filter(Boolean).join(" ");

        // Match products from DB + catalog
        const [dbProducts, catalogProducts] = await Promise.all([
          matchDbProducts(claudeAnalysis.detectedObjects || []),
          Promise.resolve(matchCatalogProducts(claudeAnalysis.detectedObjects || [])),
        ]);

        // DB products first, then catalog (no duplicates by name)
        const dbNames = new Set(dbProducts.map((p) => normalize(p.name)));
        const uniqueCatalog = catalogProducts.filter((p) => !dbNames.has(normalize(p.name)));
        matchedProducts = [...dbProducts, ...uniqueCatalog].slice(0, 8);

        fs.unlink(imageFile.path, () => {});
      } catch (err) {
        console.error("Claude Vision error:", err.message);
        if (imageFile) fs.unlink(imageFile.path, () => {});
      }
    } else if (imageFile) {
      // No API key — still try to match catalog from text hint
      if (hint) matchedProducts = matchCatalogProducts(hint.split(" "));
      fs.unlink(imageFile.path, () => {});
    } else if (hint) {
      // Text only — match catalog from keywords in description
      const keywords = extractKeywords(hint);
      matchedProducts = matchCatalogProducts(keywords);
    }

    if (!hadImage && !detectionText && !claudeAnalysis) {
      return res.status(400).json({ message: "Adaugă o imagine sau o descriere." });
    }

    // ── Score + boost styles ────────────────────────────────────────────────
    let scoredStyles = scoreStylesFromText(styles, detectionText || "");

    if (claudeAnalysis?.primaryStyle) {
      const primary = normalize(claudeAnalysis.primaryStyle);
      scoredStyles = scoredStyles.map((s) => {
        const hit =
          normalize(s.title).includes(primary) ||
          primary.includes(normalize(s.title));
        return hit ? { ...s, assistantScore: s.assistantScore + 15 } : s;
      });
    }

    if (claudeAnalysis?.secondaryStyle) {
      const secondary = normalize(claudeAnalysis.secondaryStyle);
      scoredStyles = scoredStyles.map((s) => {
        const hit =
          normalize(s.title).includes(secondary) ||
          secondary.includes(normalize(s.title));
        return hit ? { ...s, assistantScore: s.assistantScore + 7 } : s;
      });
    }

    let recommendations = scoredStyles
      .filter((s) => s.assistantScore > 0)
      .sort((a, b) => b.assistantScore - a.assistantScore)
      .slice(0, 3);

    if (recommendations.length === 0) recommendations = scoredStyles.slice(0, 3);

    const suggestedColors = claudeAnalysis?.colors?.length
      ? claudeAnalysis.colors
      : [...new Set(recommendations.flatMap((s) => Array.isArray(s.colors) ? s.colors : []))].slice(0, 6);

    const suggestedMaterials = claudeAnalysis?.materials?.length
      ? claudeAnalysis.materials
      : [...new Set(recommendations.flatMap((s) => Array.isArray(s.materials) ? s.materials : []))].slice(0, 6);

    const roomType =
      claudeAnalysis?.roomType ||
      (normalize(detectionText).includes("dormitor") ? "dormitor"
        : normalize(detectionText).includes("living") ? "living"
        : normalize(detectionText).includes("bucatarie") ? "bucătărie"
        : normalize(detectionText).includes("birou") ? "birou"
        : "cameră");

    const message = claudeAnalysis
      ? claudeAnalysis.summary || `Am identificat stilul ${claudeAnalysis.primaryStyle}.`
      : "Am generat recomandări pe baza descrierii tale și a stilurilor existente în Nestify.";

    const advice = claudeAnalysis?.recommendation
      || `Pentru un ${roomType} coerent în stil ${recommendations[0]?.title || "ales"}, pornește de la o paletă de 3-4 culori și repetă aceleași materiale în mobilier, textile și decorațiuni.`;

    res.json({
      message,
      detected: {
        keywords: extractKeywords(detectionText),
        roomType,
        claudeAnalysis,
      },
      recommendations,
      matchedProducts,
      suggestions: {
        colors: suggestedColors,
        materials: suggestedMaterials,
        advice,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare la generarea sugestiilor.", error: error.message });
  }
};

const getProjectAssistantSuggestions = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const { prompt } = req.body;

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.user.id },
      include: {
        moodboards: {
          include: { items: { include: { image: { include: { style: true } } } } },
        },
        tasks: true,
        inspirations: true,
      },
    });

    if (!project) return res.status(404).json({ message: "Proiectul nu există." });

    const projectContext = normalize(
      [
        project.title, project.description,
        project.tasks.map((t) => t.text).join(" "),
        project.moodboards.flatMap((m) => m.items.map((i) => i.image?.title)).join(" "),
        project.moodboards.flatMap((m) => m.items.map((i) => i.image?.style?.title)).join(" "),
      ].join(" ")
    );

    const styles = await prisma.style.findMany();
    const scoredStyles = scoreStylesFromText(styles, `${prompt} ${projectContext}`);

    const recommendations = scoredStyles
      .sort((a, b) => b.assistantScore - a.assistantScore)
      .slice(0, 3);

    res.json({
      message: "Am analizat proiectul tău și am generat sugestii contextualizate.",
      projectSummary: {
        title: project.title,
        tasks: project.tasks.length,
        moodboards: project.moodboards.length,
        inspirations: project.inspirations.length,
      },
      recommendations,
      advice: "Încearcă să păstrezi consecvența între materiale, paleta cromatică și piesele dominante pentru un rezultat coerent.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Eroare AI contextual.", error: error.message });
  }
};

module.exports = { getDesignAssistantSuggestions, getProjectAssistantSuggestions };
