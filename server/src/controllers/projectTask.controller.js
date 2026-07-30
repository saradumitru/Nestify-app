const prisma = require("../config/prisma");

const createTask = async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        error: "Textul taskului este obligatoriu.",
      });
    }

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

    const task = await prisma.projectTask.create({
      data: {
        text,
        projectId,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Eroare la crearea taskului.",
    });
  }
};

const toggleTask = async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const task = await prisma.projectTask.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!task) {
      return res.status(404).json({
        error: "Taskul nu există.",
      });
    }

    const updatedTask = await prisma.projectTask.update({
      where: {
        id: taskId,
      },
      data: {
        completed: !task.completed,
      },
    });

    res.json(updatedTask);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Eroare la actualizarea taskului.",
    });
  }
};

module.exports = {
  createTask,
  toggleTask,
};