const prisma = require("../config/prisma");
const path   = require("path");

async function extractDominantColors(filename) {
  try {
    const { Vibrant } = await import("node-vibrant/node");
    const filePath = path.join(__dirname, "../../uploads", filename);
    const palette  = await Vibrant.from(filePath).getPalette();
    return Object.values(palette)
      .filter(Boolean)
      .map(s => s.hex);
  } catch {
    return [];
  }
}

const getStyles = async (req, res) => {
  try {
    const styles = await prisma.style.findMany({
      include: {
        category: true,
        images: {
          include: {
            objects: {
              include: {
                productLinks: true,
              },
            },
          },
        },
        galleryPhotos: {
          include: { objects: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    res.json(styles);
    } catch (error) {
  console.error("GET /api/styles error:", error);

  res.status(500).json({
    message: "Eroare la preluarea stilurilor",
    error: error.message,
  });
}
//   } catch (error) {
//     res.status(500).json({
//       message: "Eroare la preluarea stilurilor",
//       error: error.message,
//     });
//   }
 };

const getStyleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const style = await prisma.style.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          include: {
            objects: {
              include: {
                productLinks: true,
              },
            },
          },
        },
        galleryPhotos: {
          include: {
            objects: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!style) {
      return res.status(404).json({ message: "Stilul nu există" });
    }

    res.json(style);
  } catch (error) {
    res.status(500).json({
      message: "Eroare la preluarea stilului",
      error: error.message,
    });
  }
};

const createStyle = async (req, res) => {
  try {
    const {
      title,
      slug,
      kicker,
      description,
      history,
      period,
      audience,
      colors,
      materials,
      categoryId,
    } = req.body;

    const imageUrl = req.file ? req.file.url : null;

    const style = await prisma.style.create({
      data: {
        name: title,
        title,
        slug,
        kicker,
        description,
        history,
        period,
        audience,
        colors: colors ? JSON.parse(colors) : [],
        materials: materials ? JSON.parse(materials) : [],
        imageUrl,
        categoryId: Number(categoryId),
      },
    });

    if (req.file) {
      const dominant = await extractDominantColors(req.file.filename);
      if (dominant.length) {
        await prisma.style.update({ where: { id: style.id }, data: { dominantColors: dominant } });
        style.dominantColors = dominant;
      }
    }

    res.status(201).json(style);
  } catch (error) {
    res.status(500).json({ message: "Eroare la crearea stilului", error: error.message });
  }
};

const updateStyle = async (req, res) => {
  try {
    const { id } = req.params;

    const existingStyle = await prisma.style.findUnique({
      where: { id: Number(id) },
    });

    if (!existingStyle) {
      return res.status(404).json({ message: "Stilul nu există" });
    }

    const {
      title,
      slug,
      kicker,
      description,
      history,
      period,
      audience,
      colors,
      materials,
      categoryId,
    } = req.body;

    const imageUrl = req.file
      ? req.file.url
      : existingStyle.imageUrl;

    const updatedStyle = await prisma.style.update({
      where: { id: Number(id) },
      data: {
        name: title ?? existingStyle.name,
        title: title ?? existingStyle.title,
        slug: slug ?? existingStyle.slug,
        kicker: kicker ?? existingStyle.kicker,
        description: description ?? existingStyle.description,
        history: history ?? existingStyle.history,
        period: period ?? existingStyle.period,
        audience: audience ?? existingStyle.audience,
        colors: colors ? JSON.parse(colors) : existingStyle.colors,
        materials: materials ? JSON.parse(materials) : existingStyle.materials,
        imageUrl,
        categoryId: categoryId ? Number(categoryId) : existingStyle.categoryId,
      },
    });

    if (req.file) {
      const dominant = await extractDominantColors(req.file.filename);
      if (dominant.length) {
        await prisma.style.update({ where: { id: Number(id) }, data: { dominantColors: dominant } });
        updatedStyle.dominantColors = dominant;
      }
    }

    res.json(updatedStyle);
  } catch (error) {
    res.status(500).json({
      message: "Eroare la actualizarea stilului",
      error: error.message,
    });
  }
};

const deleteStyle = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.style.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Stil șters cu succes" });
  } catch (error) {
    res.status(500).json({
      message: "Eroare la ștergerea stilului",
      error: error.message,
    });
  }
};
const getRecommendedStyles = async (req, res) => {
  try {
    const { slug } = req.params;

    const currentStyle = await prisma.style.findUnique({
      where: { slug },
    });

    if (!currentStyle) {
      return res.status(404).json({ message: "Stilul nu există." });
    }

    const allStyles = await prisma.style.findMany({
      where: {
        slug: {
          not: slug,
        },
      },
      include: {
        category: true,
        images: true,
      },
    });

    const currentColors = Array.isArray(currentStyle.colors)
      ? currentStyle.colors.map((item) => String(item).toLowerCase())
      : [];

    const currentMaterials = Array.isArray(currentStyle.materials)
      ? currentStyle.materials.map((item) => String(item).toLowerCase())
      : [];

    const scoredStyles = allStyles.map((style) => {
      const styleColors = Array.isArray(style.colors)
        ? style.colors.map((item) => String(item).toLowerCase())
        : [];
      
        const styleMaterials = Array.isArray(style.materials)
        ? style.materials.map((item) => String(item).toLowerCase())
        : [];
      let score = 0;
      
      styleColors.forEach((color) => {
        if (currentColors.includes(color)) {
          score += 2;
        }
      });
      
      styleMaterials.forEach((material) => {
        if (currentMaterials.includes(material)) {
          score += 3;
        }
      });

      if (style.categoryId === currentStyle.categoryId) {
        score += 2;
      }
      
      return {
        ...style,
        recommendationScore: score,
      };
    });

    const recommendations = scoredStyles
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3);

    res.json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Eroare la generarea recomandărilor.",
      error: error.message,
    });
  }
};
const getPersonalizedStyles = async (req, res) => {
  try {
    const userId = req.user.id;

    const [quizResult, favorites, allStyles] = await Promise.all([
      prisma.quizResult.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { recommendedStyle: true },
      }),
      prisma.favorite.findMany({
        where: { userId },
        include: { image: { select: { styleId: true } } },
      }),
      prisma.style.findMany({
        include: { category: true, images: { take: 1 } },
      }),
    ]);

    const recommended   = quizResult?.recommendedStyle;
    const favStyleCounts = {};
    favorites.forEach(f => {
      const sid = f.image?.styleId;
      if (!sid) return;
      favStyleCounts[sid] = (favStyleCounts[sid] || 0) + 1;
    });

    const scored = allStyles.map(style => {
      let score = 0;
      if (recommended?.id === style.id) score += 10;
      if (favStyleCounts[style.id]) score += Math.min(favStyleCounts[style.id] * 3, 9);
      if (recommended && style.categoryId === recommended.categoryId && style.id !== recommended.id) score += 3;
      return { ...style, relevanceScore: score };
    });

    const sorted = scored
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 6);

    res.json({ styles: sorted, basedOn: recommended ? 'quiz' : 'popular' });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la personalizare', error: error.message });
  }
};

const addStyleGalleryImage = async (req, res) => {
  try {
    const { id } = req.params;
    const style = await prisma.style.findUnique({ where: { id: Number(id) } });
    if (!style) return res.status(404).json({ message: 'Stilul nu există' });
    const imageUrl = req.file ? req.file.url : null;
    if (!imageUrl) return res.status(400).json({ message: 'Imaginea lipsește' });

    const photo = await prisma.styleGalleryPhoto.create({
      data: {
        styleId: Number(id),
        imageUrl,
        caption: req.body.caption || null,
      },
      include: { objects: true },
    });

    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la adăugarea imaginii', error: error.message });
  }
};

const deleteStyleGalleryPhoto = async (req, res) => {
  try {
    const { id, photoId } = req.params;

    const photo = await prisma.styleGalleryPhoto.findFirst({
      where: { id: Number(photoId), styleId: Number(id) },
    });
    if (!photo) return res.status(404).json({ message: 'Poza nu există' });

    await prisma.styleGalleryPhoto.delete({ where: { id: Number(photoId) } });
    res.json({ message: 'Poză ștearsă' });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la ștergerea pozei', error: error.message });
  }
};

const addGalleryPhotoObject = async (req, res) => {
  try {
    const { id, photoId } = req.params;
    const { name, description, shopLink, price } = req.body;
    const imageUrl = req.file ? req.file.url : null;

    if (!name) return res.status(400).json({ message: 'Numele obiectului este obligatoriu' });

    const photo = await prisma.styleGalleryPhoto.findFirst({
      where: { id: Number(photoId), styleId: Number(id) },
    });
    if (!photo) return res.status(404).json({ message: 'Poza nu există' });

    const obj = await prisma.styleGalleryObject.create({
      data: {
        photoId: Number(photoId),
        name,
        description: description || null,
        shopLink: shopLink || null,
        price: price || null,
        imageUrl,
      },
    });

    res.status(201).json(obj);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la adăugarea obiectului', error: error.message });
  }
};

const deleteGalleryPhotoObject = async (req, res) => {
  try {
    const { objectId } = req.params;
    await prisma.styleGalleryObject.delete({ where: { id: Number(objectId) } });
    res.json({ message: 'Obiect șters' });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la ștergerea obiectului', error: error.message });
  }
};

module.exports = {
  getStyles,
  getStyleBySlug,
  getRecommendedStyles,
  getPersonalizedStyles,
  createStyle,
  updateStyle,
  deleteStyle,
  addStyleGalleryImage,
  deleteStyleGalleryPhoto,
  addGalleryPhotoObject,
  deleteGalleryPhotoObject,
};
