const prisma = require('../config/prisma');

const getRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({ orderBy: { order: 'asc' } });
    res.json(rooms);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const createRoom = async (req, res) => {
  try {
    const { title, description, order } = req.body;
    const imageUrl = req.file ? req.file.url : null;
    const room = await prisma.room.create({ data: { title, description: description || null, imageUrl, order: order ? Number(order) : 0 } });
    res.status(201).json(room);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const updateRoom = async (req, res) => {
  try {
    const existing = await prisma.room.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing) return res.status(404).json({ error: 'Camera nu există.' });
    const { title, description, order } = req.body;
    const imageUrl = req.file ? req.file.url : existing.imageUrl;
    const room = await prisma.room.update({
      where: { id: Number(req.params.id) },
      data: { title: title || existing.title, description: description ?? existing.description, imageUrl, order: order !== undefined ? Number(order) : existing.order },
    });
    res.json(room);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const deleteRoom = async (req, res) => {
  try {
    await prisma.room.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Cameră ștearsă.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { getRooms, createRoom, updateRoom, deleteRoom };
