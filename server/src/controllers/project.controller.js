const prisma = require("../config/prisma");

const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
  where: {
    userId: req.user.id,
  },
  include: {
  moodboards: {
    include: {
      items: true,
    },
  },

  tasks: {
    orderBy: {
      createdAt: "desc",
    },
  },

  inspirations: {
    orderBy: {
      createdAt: "desc",
    },
  },
},
});

    res.json(projects);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Eroare la preluarea proiectelor.",
    });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        error: "Titlul este obligatoriu.",
      });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        userId: req.user.id,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Eroare la crearea proiectului.",
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const project = await prisma.project.findFirst({ where: { id, userId: req.user.id } });
    if (!project) return res.status(404).json({ error: "Proiect negăsit." });
    await prisma.project.delete({ where: { id } });
    res.json({ message: "Proiect șters." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Eroare la ștergerea proiectului." });
  }
};

module.exports = {
  getProjects,
  createProject,
  deleteProject,
};