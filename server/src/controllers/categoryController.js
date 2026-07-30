const prisma = require("../config/prisma");

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.styleCategory.findMany({
      orderBy: {
        id: "asc",
      },
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Eroare la preluarea categoriilor",
      error: error.message,
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        message: "Numele și slug-ul sunt obligatorii.",
      });
    }

    const category = await prisma.styleCategory.create({
      data: {
        name,
        slug,
        description,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({
      message: "Eroare la crearea categoriei",
      error: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.body;

    const existingCategory = await prisma.styleCategory.findUnique({
      where: { id: Number(id) },
    });

    if (!existingCategory) {
      return res.status(404).json({
        message: "Categoria nu există.",
      });
    }

    const updatedCategory = await prisma.styleCategory.update({
      where: { id: Number(id) },
      data: {
        name: name ?? existingCategory.name,
        slug: slug ?? existingCategory.slug,
        description: description ?? existingCategory.description,
      },
    });

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({
      message: "Eroare la actualizarea categoriei",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCategory = await prisma.styleCategory.findUnique({
      where: { id: Number(id) },
      include: {
        styles: true,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        message: "Categoria nu există.",
      });
    }

    await prisma.styleCategory.delete({
      where: { id: Number(id) },
    });

    res.json({
      message: "Categoria a fost ștearsă cu succes.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Eroare la ștergerea categoriei",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};