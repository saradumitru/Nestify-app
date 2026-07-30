const designerMiddleware = (req, res, next) => {
  if (!req.user || (req.user.role !== 'DESIGNER' && req.user.role !== 'ADMIN')) {
    return res.status(403).json({ message: 'Acces interzis. Doar designerii au acces.' });
  }
  next();
};

module.exports = designerMiddleware;
