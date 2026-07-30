const prisma = require("../config/prisma");

const getInteriorBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const interior = await prisma.interiorImage.findUnique({
      where: { slug },
      include: {
        style: true,
        objects: { include: { productLinks: true } },
        galleryPhotos: { include: { objects: true }, orderBy: { createdAt: 'asc' } },
      },
    });

    if (!interior) {
      return res.status(404).json({ message: "Interiorul nu există" });
    }

    res.json(interior);
  } catch (error) {
    res.status(500).json({
      message: "Eroare la preluarea interiorului",
      error: error.message,
    });
  }
};

const getInteriorsByRoomType = async (req, res) => {
  try {
    const { roomType } = req.query;
    const where = roomType ? { roomType } : {};
    const interiors = await prisma.interiorImage.findMany({
      where,
      include: {
        style: { select: { id: true, title: true, slug: true } },
        galleryPhotos: { include: { objects: true }, orderBy: { createdAt: 'asc' } },
        objects: { include: { productLinks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(interiors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createInterior = async (req, res) => {
  try {
    const { title, slug, subtitle, description, styleId, roomType } = req.body;
    const imageUrl = req.file ? req.file.url : null;

    const interior = await prisma.interiorImage.create({
      data: {
        title,
        slug,
        subtitle,
        description,
        imageUrl,
        roomType: roomType || null,
        styleId: Number(styleId),
      },
    });

    res.status(201).json(interior);
  } catch (error) {
    res.status(500).json({
      message: "Eroare la crearea interiorului",
      error: error.message,
    });
  }
};

const createInteriorObject = async (req, res) => {
  try {
    const { interiorId } = req.params;
    const { name, description, shopLink } = req.body;
    const imageUrl = req.file ? req.file.url : null;

    const object = await prisma.imageObject.create({
      data: {
        name,
        description,
        shopLink,
        imageUrl,
        imageId: Number(interiorId),
      },
    });

    res.status(201).json(object);
  } catch (error) {
    res.status(500).json({
      message: "Eroare la crearea obiectului",
      error: error.message,
    });
  }
};

const updateInteriorObject = async (req, res) => {
  try {
    const existing = await prisma.imageObject.findUnique({ where: { id: Number(req.params.objectId) } });
    if (!existing) return res.status(404).json({ message: 'Obiectul nu există.' });
    const { name, description, shopLink } = req.body;
    const imageUrl = req.file ? req.file.url : existing.imageUrl;
    const object = await prisma.imageObject.update({
      where: { id: Number(req.params.objectId) },
      data: {
        name: name || existing.name,
        description: description ?? existing.description,
        shopLink: shopLink ?? existing.shopLink,
        imageUrl,
      },
    });
    res.json(object);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la actualizarea obiectului.', error: error.message });
  }
};

const deleteInteriorObject = async (req, res) => {
  try {
    await prisma.imageObject.delete({ where: { id: Number(req.params.objectId) } });
    res.json({ message: 'Obiect șters.' });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la ștergerea obiectului.', error: error.message });
  }
};

const addProductLink = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { title, url, price, store } = req.body;

    const link = await prisma.productLink.create({
      data: {
        title: title || '',
        url: url || '#',
        price: price || null,
        store: store || null,
        imageObjectId: Number(objectId),
      },
    });
    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la adăugarea linkului.', error: error.message });
  }
};

const updateInterior = async (req, res) => {
  try {
    const existing = await prisma.interiorImage.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ message: 'Interiorul nu există.' });
    const { title, slug, subtitle, description, styleId, roomType } = req.body;
    const imageUrl = req.file ? req.file.url : existing.imageUrl;
    const interior = await prisma.interiorImage.update({
      where: { id: Number(req.params.id) },
      data: {
        title: title || existing.title,
        slug: slug || existing.slug,
        subtitle: subtitle ?? existing.subtitle,
        description: description ?? existing.description,
        imageUrl,
        styleId: styleId ? Number(styleId) : existing.styleId,
        roomType: roomType || null,
      },
    });
    res.json(interior);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la actualizarea interiorului.', error: error.message });
  }
};

const deleteInterior = async (req, res) => {
  try {
    await prisma.interiorImage.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Interior șters.' });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la ștergerea interiorului.', error: error.message });
  }
};

const addInteriorGalleryImage = async (req, res) => {
  try {
    const interior = await prisma.interiorImage.findUnique({ where: { id: Number(req.params.id) } });
    if (!interior) return res.status(404).json({ message: 'Interiorul nu există.' });
    const imageUrl = req.file ? req.file.url : null;
    if (!imageUrl) return res.status(400).json({ message: 'Nicio imagine furnizată.' });
    const caption = req.body.caption || null;
    const photo = await prisma.interiorGalleryPhoto.create({
      data: { interiorId: interior.id, imageUrl, caption },
      include: { objects: true },
    });
    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la adăugarea imaginii.', error: error.message });
  }
};

const deleteInteriorGalleryPhoto = async (req, res) => {
  try {
    await prisma.interiorGalleryPhoto.delete({ where: { id: Number(req.params.photoId) } });
    res.json({ message: 'Fotografie ștearsă.' });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la ștergerea imaginii.', error: error.message });
  }
};

const addInteriorGalleryObject = async (req, res) => {
  try {
    const photo = await prisma.interiorGalleryPhoto.findUnique({ where: { id: Number(req.params.photoId) } });
    if (!photo) return res.status(404).json({ message: 'Fotografie negăsită.' });
    const { name, description, shopLink, price } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Numele obiectului este obligatoriu.' });
    const imageUrl = req.file ? req.file.url : null;
    const object = await prisma.interiorGalleryObject.create({
      data: { photoId: photo.id, name, description: description || null, shopLink: shopLink || null, price: price || null, imageUrl },
    });
    res.status(201).json(object);
  } catch (error) {
    res.status(500).json({ message: 'Eroare la adăugarea obiectului.', error: error.message });
  }
};

const deleteInteriorGalleryObject = async (req, res) => {
  try {
    await prisma.interiorGalleryObject.delete({ where: { id: Number(req.params.objectId) } });
    res.json({ message: 'Obiect șters.' });
  } catch (error) {
    res.status(500).json({ message: 'Eroare la ștergerea obiectului.', error: error.message });
  }
};

module.exports = {
  getInteriorsByRoomType,
  getInteriorBySlug,
  createInterior,
  updateInterior,
  deleteInterior,
  createInteriorObject,
  updateInteriorObject,
  deleteInteriorObject,
  addProductLink,
  addInteriorGalleryImage,
  deleteInteriorGalleryPhoto,
  addInteriorGalleryObject,
  deleteInteriorGalleryObject,
};
