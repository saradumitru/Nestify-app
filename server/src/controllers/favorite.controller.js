const prisma = require('../config/prisma');

const FAVORITE_TARGETS = [
  {
    key: 'imageId',
    model: prisma.interiorImage,
  },
  {
    key: 'styleGalleryPhotoId',
    model: prisma.styleGalleryPhoto,
  },
  {
    key: 'interiorGalleryPhotoId',
    model: prisma.interiorGalleryPhoto,
  },
];

const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const target = FAVORITE_TARGETS.find(({ key }) => req.body[key]);

    if (!target) {
      return res.status(400).json({ error: 'Trimite imageId, styleGalleryPhotoId sau interiorGalleryPhotoId.' });
    }

    const targetId = Number(req.body[target.key]);
    if (!Number.isInteger(targetId) || targetId <= 0) {
      return res.status(400).json({ error: 'ID-ul favoritei este invalid.' });
    }

    const exists = await target.model.findUnique({ where: { id: targetId } });
    if (!exists) {
      return res.status(404).json({ error: 'Imaginea nu există.' });
    }

    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId,
        [target.key]: targetId,
      },
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });

      return res.json({ message: 'Removed from favorites' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        [target.key]: targetId,
      },
    });

    res.status(201).json({
      message: 'Added to favorites',
      favorite,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la actualizarea favoritei.' });
  }
};

const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        image: {
          include: {
            style: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
        styleGalleryPhoto: {
          include: {
            style: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
        interiorGalleryPhoto: {
          include: {
            interior: {
              include: {
                style: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(favorites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la preluarea favoritelor.' });
  }
};

module.exports = {
  toggleFavorite,
  getFavorites,
};
