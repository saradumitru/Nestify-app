const prisma = require("../config/prisma");

const addInspiration = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const { caption } = req.body;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user.id,
      },
    });

    if (!project) {
      return res.status(404).json({
        error: "Proiectul nu există.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Imaginea este obligatorie.",
      });
    }

    const inspiration = await prisma.projectInspiration.create({
      data: {
        caption,
        imageUrl: req.file.url,
        projectId,
      },
    });

    res.status(201).json(inspiration);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Eroare la încărcarea imaginii.",
    });
  }
};

module.exports = {
  addInspiration,
};
