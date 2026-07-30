const prisma = require('../config/prisma');

const normalizeSourceUrl = (url) => {
  const value = String(url || '').trim();
  if (!value) return null;
  if (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^https?:\/\//i.test(value)) return null;

  const withProtocol = /^https?:\/\//i.test(value)
    ? value
    : value.startsWith('//')
      ? `https:${value}`
      : `https://${value}`;

  try {
    const parsed = new URL(withProtocol);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
  } catch {
    return null;
  }
};

const normalizeStory = (story) => story
  ? { ...story, sourceUrl: normalizeSourceUrl(story.sourceUrl) }
  : story;

const parseStoryId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const getStories = async (req, res) => {
  try {
    const stories = await prisma.story.findMany({ orderBy: { publishedAt: 'desc' } });
    res.json(stories.map(normalizeStory));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const getStoryById = async (req, res) => {
  try {
    const id = parseStoryId(req.params.id);
    if (!id) return res.status(404).json({ error: 'Articolul nu exista.' });

    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) return res.status(404).json({ error: 'Articolul nu exista.' });

    res.json(normalizeStory(story));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const createStory = async (req, res) => {
  try {
    const { title, kicker, excerpt, content, author, sourceUrl, readTime } = req.body;
    const imageUrl = req.file ? req.file.url : null;

    const story = await prisma.story.create({
      data: {
        title,
        kicker: kicker || 'Popular',
        excerpt: excerpt || null,
        content: content || null,
        imageUrl,
        author: author || null,
        sourceUrl: normalizeSourceUrl(sourceUrl),
        readTime: readTime || null,
      },
    });

    res.status(201).json(normalizeStory(story));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const updateStory = async (req, res) => {
  try {
    const id = parseStoryId(req.params.id);
    if (!id) return res.status(404).json({ error: 'Articolul nu exista.' });

    const existing = await prisma.story.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Articolul nu exista.' });

    const { title, kicker, excerpt, content, author, sourceUrl, readTime } = req.body;
    const imageUrl = req.file ? req.file.url : existing.imageUrl;

    const story = await prisma.story.update({
      where: { id },
      data: {
        title: title || existing.title,
        kicker: kicker || existing.kicker,
        excerpt: excerpt ?? existing.excerpt,
        content: content ?? existing.content,
        imageUrl,
        author: author !== undefined ? (author || null) : existing.author,
        sourceUrl: sourceUrl !== undefined ? normalizeSourceUrl(sourceUrl) : existing.sourceUrl,
        readTime: readTime !== undefined ? (readTime || null) : existing.readTime,
      },
    });

    res.json(normalizeStory(story));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const deleteStory = async (req, res) => {
  try {
    const id = parseStoryId(req.params.id);
    if (!id) return res.status(404).json({ error: 'Articolul nu exista.' });

    await prisma.story.delete({ where: { id } });
    res.json({ message: 'Articol sters.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = { getStories, getStoryById, createStory, updateStory, deleteStory };
