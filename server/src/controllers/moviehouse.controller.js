const prisma = require('../config/prisma');

const getAllMovieHouses = async (req, res) => {
  try {
    const houses = await prisma.movieHouse.findMany({
      orderBy: { createdAt: 'desc' },
      include: { locations: { orderBy: { order: 'asc' } } },
    });
    res.json(houses);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la preluarea movie houses.' });
  }
};

const getMovieHouseBySlug = async (req, res) => {
  try {
    const house = await prisma.movieHouse.findUnique({
      where: { slug: req.params.slug },
      include: { locations: { orderBy: { order: 'asc' } } },
    });
    if (!house) return res.status(404).json({ error: 'Movie house negăsit.' });
    res.json(house);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la preluare.' });
  }
};

const createMovieHouse = async (req, res) => {
  try {
    const { title, slug, kicker, description, history } = req.body;
    const imageUrl = req.file ? req.file.url : null;

    const house = await prisma.movieHouse.create({
      data: { title, slug, kicker, description, history, imageUrl, gallery: [] },
    });
    res.status(201).json(house);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Slug-ul există deja.' });
    res.status(500).json({ error: 'Eroare la creare.' });
  }
};

const addMovieHouseGalleryImage = async (req, res) => {
  try {
    const house = await prisma.movieHouse.findUnique({ where: { id: Number(req.params.id) } });
    if (!house) return res.status(404).json({ error: 'Movie house negăsit.' });

    const imageUrl = req.file ? req.file.url : null;
    if (!imageUrl) return res.status(400).json({ error: 'Nu a fost furnizată o imagine.' });

    const gallery = Array.isArray(house.gallery) ? house.gallery : [];
    const updated = await prisma.movieHouse.update({
      where: { id: house.id },
      data: { gallery: [...gallery, imageUrl] },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la adăugarea imaginii.' });
  }
};

const updateMovieHouse = async (req, res) => {
  try {
    const existing = await prisma.movieHouse.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ error: 'Movie house negăsit.' });
    const { title, slug, kicker, description, history } = req.body;
    const imageUrl = req.file ? req.file.url : existing.imageUrl;
    const house = await prisma.movieHouse.update({
      where: { id: Number(req.params.id) },
      data: {
        title: title || existing.title,
        slug: slug || existing.slug,
        kicker: kicker ?? existing.kicker,
        description: description ?? existing.description,
        history: history ?? existing.history,
        imageUrl,
      },
    });
    res.json(house);
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Slug-ul există deja.' });
    res.status(500).json({ error: 'Eroare la actualizare.' });
  }
};

const deleteMovieHouseGalleryPhoto = async (req, res) => {
  try {
    const house = await prisma.movieHouse.findUnique({ where: { id: Number(req.params.id) } });
    if (!house) return res.status(404).json({ error: 'Movie house negăsit.' });
    const gallery = Array.isArray(house.gallery) ? [...house.gallery] : [];
    const idx = Number(req.params.index);
    if (idx < 0 || idx >= gallery.length) return res.status(400).json({ error: 'Index invalid.' });
    gallery.splice(idx, 1);
    const updated = await prisma.movieHouse.update({ where: { id: house.id }, data: { gallery } });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Eroare la ștergerea pozei.' });
  }
};

const deleteMovieHouse = async (req, res) => {
  try {
    await prisma.movieHouse.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Șters.' });
  } catch (err) {
    res.status(500).json({ error: 'Eroare la ștergere.' });
  }
};

// ─── Locations ───
const createMovieLocation = async (req, res) => {
  try {
    const { title, kicker, description, history, order } = req.body;
    const imageUrl = req.file ? req.file.url : null;
    const location = await prisma.movieLocation.create({
      data: { movieHouseId: Number(req.params.id), title, kicker: kicker || null, description: description || null, history: history || null, imageUrl, gallery: [], order: order ? Number(order) : 0 },
    });
    res.status(201).json(location);
  } catch (err) { res.status(500).json({ error: 'Eroare la creare locație.' }); }
};

const updateMovieLocation = async (req, res) => {
  try {
    const existing = await prisma.movieLocation.findUnique({ where: { id: Number(req.params.locId) } });
    if (!existing) return res.status(404).json({ error: 'Locație negăsită.' });
    const { title, kicker, description, history } = req.body;
    const imageUrl = req.file ? req.file.url : existing.imageUrl;
    const location = await prisma.movieLocation.update({
      where: { id: Number(req.params.locId) },
      data: { title: title || existing.title, kicker: kicker ?? existing.kicker, description: description ?? existing.description, history: history ?? existing.history, imageUrl },
    });
    res.json(location);
  } catch (err) { res.status(500).json({ error: 'Eroare la actualizare locație.' }); }
};

const deleteMovieLocation = async (req, res) => {
  try {
    await prisma.movieLocation.delete({ where: { id: Number(req.params.locId) } });
    res.json({ message: 'Locație ștearsă.' });
  } catch (err) { res.status(500).json({ error: 'Eroare la ștergere.' }); }
};

const addLocationGalleryImage = async (req, res) => {
  try {
    const location = await prisma.movieLocation.findUnique({ where: { id: Number(req.params.locId) } });
    if (!location) return res.status(404).json({ error: 'Locație negăsită.' });
    const imageUrl = req.file ? req.file.url : null;
    if (!imageUrl) return res.status(400).json({ error: 'Nicio imagine furnizată.' });
    const gallery = Array.isArray(location.gallery) ? location.gallery : [];
    const updated = await prisma.movieLocation.update({ where: { id: location.id }, data: { gallery: [...gallery, imageUrl] } });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: 'Eroare la adăugarea imaginii.' }); }
};

const deleteLocationGalleryPhoto = async (req, res) => {
  try {
    const location = await prisma.movieLocation.findUnique({ where: { id: Number(req.params.locId) } });
    if (!location) return res.status(404).json({ error: 'Locație negăsită.' });
    const gallery = Array.isArray(location.gallery) ? [...location.gallery] : [];
    const idx = Number(req.params.index);
    if (idx < 0 || idx >= gallery.length) return res.status(400).json({ error: 'Index invalid.' });
    gallery.splice(idx, 1);
    const updated = await prisma.movieLocation.update({ where: { id: location.id }, data: { gallery } });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: 'Eroare la ștergerea pozei.' }); }
};

module.exports = { getAllMovieHouses, getMovieHouseBySlug, createMovieHouse, addMovieHouseGalleryImage, updateMovieHouse, deleteMovieHouseGalleryPhoto, deleteMovieHouse, createMovieLocation, updateMovieLocation, deleteMovieLocation, addLocationGalleryImage, deleteLocationGalleryPhoto };
