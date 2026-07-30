const prisma = require('../config/prisma');
const { v4: uuidv4 } = require("uuid");

const getMoodboards = async (req, res) => {
  try {
    const moodboards = await prisma.moodboard.findMany({
      where: { userId: req.user.id },
      include: {
        project: true,
        items: {
          include: {
            image: {
              include: {
                style: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(moodboards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la preluarea moodboard-urilor.' });
  }
};

const getMoodboardById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'Id moodboard invalid.' });
    }

    const moodboard = await prisma.moodboard.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        items: {
          include: {
            image: {
              include: {
                style: true,
                objects: {
                  include: {
                    productLinks: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!moodboard) {
      return res.status(404).json({ error: 'Moodboard-ul nu a fost găsit.' });
    }

    res.json(moodboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la preluarea moodboard-ului.' });
  }
};

const createMoodboard = async (req, res) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
    const projectId = req.body.projectId ? Number(req.body.projectId) : null;

    if (!title) {
      return res.status(400).json({ error: 'Titlul moodboard-ului este obligatoriu.' });
    }

    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId: req.user.id,
        },
      });

      if (!project) {
        return res.status(404).json({ error: 'Proiectul nu a fost gasit.' });
      }
    }

    const moodboard = await prisma.moodboard.create({
      data: {
        title,
        userId: req.user.id,
        projectId,
      },
      include: {
        project: true,
        items: {
          include: {
            image: {
              include: {
                style: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(moodboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la crearea moodboard-ului.' });
  }
};

const deleteMoodboard = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'Id moodboard invalid.' });
    }

    const moodboard = await prisma.moodboard.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!moodboard) {
      return res.status(404).json({ error: 'Moodboard-ul nu a fost gasit.' });
    }

    await prisma.moodboard.delete({
      where: { id },
    });

    res.json({ message: 'Moodboard sters cu succes.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la stergerea moodboard-ului.' });
  }
};

const addMoodboardItem = async (req, res) => {
  try {
    const moodboardId = Number(req.params.id);
    const imageId = Number(req.body.imageId);

    if (!moodboardId || !imageId) {
      return res.status(400).json({ error: 'moodboardId si imageId sunt obligatorii.' });
    }

    const moodboard = await prisma.moodboard.findFirst({
      where: {
        id: moodboardId,
        userId: req.user.id,
      },
    });

    if (!moodboard) {
      return res.status(404).json({ error: 'Moodboard-ul nu a fost gasit.' });
    }

    const item = await prisma.moodboardItem.upsert({
      where: {
        moodboardId_imageId: {
          moodboardId,
          imageId,
        },
      },
      update: {},
      create: {
        moodboardId,
        imageId,
      },
      include: {
        image: {
          include: {
            style: true,
          },
        },
      },
    });

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la adaugarea camerei in moodboard.' });
  }
};

const removeMoodboardItem = async (req, res) => {
  try {
    const moodboardId = Number(req.params.id);
    const imageId = Number(req.params.imageId);

    if (!moodboardId || !imageId) {
      return res.status(400).json({ error: 'moodboardId si imageId sunt obligatorii.' });
    }

    const moodboard = await prisma.moodboard.findFirst({
      where: {
        id: moodboardId,
        userId: req.user.id,
      },
    });

    if (!moodboard) {
      return res.status(404).json({ error: 'Moodboard-ul nu a fost gasit.' });
    }

    await prisma.moodboardItem.delete({
      where: {
        moodboardId_imageId: {
          moodboardId,
          imageId,
        },
      },
    });

    res.json({ message: 'Camera a fost eliminata din moodboard.' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Camera nu exista in acest moodboard.' });
    }

    console.error(error);
    res.status(500).json({ error: 'Eroare la eliminarea camerei din moodboard.' });
  }
};

const generateShareLink = async (req, res) => {
  try {
    const moodboardId = Number(req.params.id);

    const moodboard = await prisma.moodboard.findFirst({
      where: {
        id: moodboardId,
        userId: req.user.id,
      },
    });

    if (!moodboard) {
      return res.status(404).json({
        error: "Moodboard-ul nu a fost găsit.",
      });
    }

    let shareId = moodboard.shareId;

    if (!shareId) {
      shareId = uuidv4();

      await prisma.moodboard.update({
        where: {
          id: moodboardId,
        },
        data: {
          shareId,
          isPublic: true,
        },
      });
    }

    res.json({
      shareUrl: `http://localhost:5173/moodboards/public/${shareId}`,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Eroare la generarea linkului public.",
    });
  }
};

const getPublicMoodboard = async (req, res) => {
  try {
    const { shareId } = req.params;

    const moodboard = await prisma.moodboard.findFirst({
      where: {
        shareId,
        isPublic: true,
      },
      include: {
        items: {
          include: {
            image: {
              include: {
                style: true,
              },
            },
          },
        },
      },
    });

    if (!moodboard) {
      return res.status(404).json({
        error: "Moodboard-ul nu există.",
      });
    }

    prisma.moodboard.update({ where: { id: moodboard.id }, data: { views: { increment: 1 } } }).catch(() => {});

    const likesCount = await prisma.moodboardLike.count({ where: { moodboardId: moodboard.id } });
    let likedByMe = false;
    if (req.user?.id) {
      const like = await prisma.moodboardLike.findUnique({
        where: { userId_moodboardId: { userId: req.user.id, moodboardId: moodboard.id } },
      });
      likedByMe = !!like;
    }

    res.json({ ...moodboard, views: (moodboard.views || 0) + 1, likesCount, likedByMe });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Eroare la preluarea moodboard-ului public." });
  }
};

const getPublicMoodboards = async (req, res) => {
  try {
    const userId = req.user?.id || null;

    const moodboards = await prisma.moodboard.findMany({
      where: { isPublic: true },
      include: {
        items: {
          take: 4,
          include: { image: { include: { style: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { likes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let likedIds = new Set();
    if (userId) {
      const liked = await prisma.moodboardLike.findMany({
        where: { userId, moodboardId: { in: moodboards.map(b => b.id) } },
        select: { moodboardId: true },
      });
      likedIds = new Set(liked.map(l => l.moodboardId));
    }

    const result = moodboards.map(({ _count, ...board }) => ({
      ...board,
      likesCount: _count.likes,
      likedByMe: likedIds.has(board.id),
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la preluarea moodboard-urilor publice.' });
  }
};

const toggleMoodboardLike = async (req, res) => {
  try {
    const moodboardId = Number(req.params.id);
    const userId = req.user.id;

    if (!moodboardId) {
      return res.status(400).json({ error: 'Id moodboard invalid.' });
    }

    const moodboard = await prisma.moodboard.findFirst({
      where: { id: moodboardId, isPublic: true },
    });

    if (!moodboard) {
      return res.status(404).json({ error: 'Moodboard-ul nu există.' });
    }

    const existing = await prisma.moodboardLike.findUnique({
      where: { userId_moodboardId: { userId, moodboardId } },
    });

    if (existing) {
      await prisma.moodboardLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.moodboardLike.create({ data: { userId, moodboardId } });
    }

    const likesCount = await prisma.moodboardLike.count({ where: { moodboardId } });
    res.json({ liked: !existing, likesCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la like.' });
  }
};

module.exports = {
  getMoodboards,
  getMoodboardById,
  createMoodboard,
  deleteMoodboard,
  addMoodboardItem,
  removeMoodboardItem,
  generateShareLink,
  getPublicMoodboard,
  getPublicMoodboards,
  toggleMoodboardLike,
};
