const prisma = require('../config/prisma');

const getDesigners = async (req, res) => {
  try {
    const designers = await prisma.designerProfile.findMany({
      include: {
        user: { select: { id: true, name: true } },
        portfolioItems: { take: 3, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(designers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la preluarea designerilor.' });
  }
};

const getDesignerById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Id invalid.' });

    const designer = await prisma.designerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        portfolioItems: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!designer) return res.status(404).json({ error: 'Designer negăsit.' });
    res.json(designer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la preluarea profilului.' });
  }
};

const getMyProfile = async (req, res) => {
  try {
    let profile = await prisma.designerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        portfolioItems: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!profile) {
      profile = await prisma.designerProfile.create({
        data: { userId: req.user.id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          portfolioItems: true,
        },
      });
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la preluarea profilului.' });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { name, bio, experience, specialties, phone, instagram, website } = req.body;
    const avatarUrl = req.file ? req.file.url : undefined;
    const displayName = typeof name === 'string' ? name.trim() : undefined;

    if (displayName !== undefined && !displayName) {
      return res.status(400).json({ error: 'Numele profilului este obligatoriu.' });
    }

    const data = {};
    if (bio !== undefined) data.bio = bio;
    if (experience !== undefined) data.experience = experience;
    if (phone !== undefined) data.phone = phone;
    if (instagram !== undefined) data.instagram = instagram;
    if (website !== undefined) data.website = website;
    if (avatarUrl) data.avatarUrl = avatarUrl;
    if (specialties !== undefined) {
      data.specialties = Array.isArray(specialties)
        ? specialties
        : JSON.parse(specialties || '[]');
    }

    const profile = await prisma.$transaction(async (tx) => {
      if (displayName !== undefined) {
        await tx.user.update({
          where: { id: req.user.id },
          data: { name: displayName },
        });
      }

      return tx.designerProfile.upsert({
        where: { userId: req.user.id },
        update: data,
        create: { userId: req.user.id, ...data },
        include: {
          user: { select: { id: true, name: true, email: true } },
          portfolioItems: { orderBy: { createdAt: 'desc' } },
        },
      });
    });

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la actualizarea profilului.' });
  }
};

const addPortfolioItem = async (req, res) => {
  try {
    const { title, description, year } = req.body;
    const files = req.files || [];
    const imageUrl = files[0] ? files[0].url : null;
    const gallery = files.slice(1).map(f => f.url);

    if (!title) return res.status(400).json({ error: 'Titlul este obligatoriu.' });

    let profile = await prisma.designerProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) {
      profile = await prisma.designerProfile.create({ data: { userId: req.user.id } });
    }

    const item = await prisma.portfolioItem.create({
      data: {
        title,
        description: description || null,
        imageUrl,
        gallery,
        year: year ? Number(year) : null,
        designerId: profile.id,
      },
    });

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la adăugarea proiectului.' });
  }
};

const updatePortfolioItem = async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);
    const { title, description, year } = req.body;
    const imageUrl = req.file ? req.file.url : undefined;

    const profile = await prisma.designerProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Profil negăsit.' });

    const existing = await prisma.portfolioItem.findFirst({
      where: { id: itemId, designerId: profile.id },
    });
    if (!existing) return res.status(404).json({ error: 'Proiect negăsit.' });

    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (year !== undefined) data.year = year ? Number(year) : null;
    if (imageUrl) data.imageUrl = imageUrl;

    const item = await prisma.portfolioItem.update({ where: { id: itemId }, data });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la actualizarea proiectului.' });
  }
};

const addPortfolioItemImages = async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);
    const profile = await prisma.designerProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Profil negăsit.' });

    const existing = await prisma.portfolioItem.findFirst({
      where: { id: itemId, designerId: profile.id },
    });
    if (!existing) return res.status(404).json({ error: 'Proiect negăsit.' });

    if (!req.files?.length) return res.status(400).json({ error: 'Nicio imagine.' });

    const newUrls = req.files.map(f => f.url);
    const currentGallery = Array.isArray(existing.gallery) ? existing.gallery : [];
    const item = await prisma.portfolioItem.update({
      where: { id: itemId },
      data: { gallery: [...currentGallery, ...newUrls] },
    });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la adăugarea imaginilor.' });
  }
};

const deletePortfolioItem = async (req, res) => {
  try {
    const itemId = Number(req.params.itemId);

    const profile = await prisma.designerProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ error: 'Profil negăsit.' });

    const existing = await prisma.portfolioItem.findFirst({
      where: { id: itemId, designerId: profile.id },
    });
    if (!existing) return res.status(404).json({ error: 'Proiect negăsit.' });

    await prisma.portfolioItem.delete({ where: { id: itemId } });
    res.json({ message: 'Proiect șters.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Eroare la ștergerea proiectului.' });
  }
};

module.exports = {
  getDesigners,
  getDesignerById,
  getMyProfile,
  updateMyProfile,
  addPortfolioItem,
  addPortfolioItemImages,
  updatePortfolioItem,
  deletePortfolioItem,
};
