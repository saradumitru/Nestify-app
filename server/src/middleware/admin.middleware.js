const prisma = require("../config/prisma");

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@nestify.app").toLowerCase();

const adminMiddleware = async (req, res, next) => {
  if (!req.user?.id) {
    return res.status(403).json({
      message: "Acces interzis. Doar administratorul are acces.",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { email: true, role: true },
    });

    if (!user || user.role !== "ADMIN" || user.email.toLowerCase() !== ADMIN_EMAIL) {
      return res.status(403).json({
        message: "Acces interzis. Doar administratorul are acces.",
      });
    }

    next();
  } catch (error) {
    console.error("Admin authorization failed:", error);
    res.status(500).json({ message: "Eroare la verificarea accesului admin." });
  }
};

module.exports = adminMiddleware;
