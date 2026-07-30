const prisma = require("../config/prisma");

const getAdminStats = async (req, res) => {
  try {
    const [
      usersCount,
      stylesCount,
      interiorsCount,
      favoritesCount,
      moodboardsCount,
      topFavoriteRooms,
      topMoodboardRooms,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.style.count(),
      prisma.interiorImage.count(),
      prisma.favorite.count(),
      prisma.moodboard.count(),

      prisma.favorite.groupBy({
        by: ["imageId"],
        _count: {
          imageId: true,
        },
        orderBy: {
          _count: {
            imageId: "desc",
          },
        },
        take: 5,
      }),

      prisma.moodboardItem.groupBy({
        by: ["imageId"],
        _count: {
          imageId: true,
        },
        orderBy: {
          _count: {
            imageId: "desc",
          },
        },
        take: 5,
      }),
    ]);

    const favoriteImageIds = topFavoriteRooms.map((item) => item.imageId);
    const moodboardImageIds = topMoodboardRooms.map((item) => item.imageId);

    const images = await prisma.interiorImage.findMany({
      where: {
        id: {
          in: [...new Set([...favoriteImageIds, ...moodboardImageIds])],
        },
      },
      include: {
        style: true,
      },
    });

    const getImageInfo = (imageId) => {
      const image = images.find((item) => item.id === imageId);

      return {
        id: image?.id,
        title: image?.title || `Camera #${imageId}`,
        slug: image?.slug,
        imageUrl: image?.imageUrl,
        style: image?.style
          ? {
              id: image.style.id,
              title: image.style.title,
              slug: image.style.slug,
            }
          : null,
      };
    };

    res.json({
      totals: {
        users: usersCount,
        styles: stylesCount,
        interiors: interiorsCount,
        favorites: favoritesCount,
        moodboards: moodboardsCount,
      },
      topFavoriteRooms: topFavoriteRooms.map((item) => ({
        image: getImageInfo(item.imageId),
        count: item._count.imageId,
      })),
      topMoodboardRooms: topMoodboardRooms.map((item) => ({
        image: getImageInfo(item.imageId),
        count: item._count.imageId,
      })),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Eroare la preluarea statisticilor admin.",
      error: error.message,
    });
  }
};

module.exports = {
  getAdminStats,
};