const express = require('express');
const protect = require('../middleware/auth.middleware');
const designerMiddleware = require('../middleware/designer.middleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getDesigners,
  getDesignerById,
  getMyProfile,
  updateMyProfile,
  addPortfolioItem,
  addPortfolioItemImages,
  updatePortfolioItem,
  deletePortfolioItem,
} = require('../controllers/designer.controller');

const router = express.Router();

// Public routes
router.get('/', getDesigners);

// Designer-only routes — must come before /:id
router.get('/me/profile', protect, designerMiddleware, getMyProfile);
router.put('/me/profile', protect, designerMiddleware, upload.single('avatar'), updateMyProfile);
router.post('/me/portfolio', protect, designerMiddleware, upload.array('images', 10), addPortfolioItem);
router.put('/me/portfolio/:itemId', protect, designerMiddleware, upload.single('image'), updatePortfolioItem);
router.post('/me/portfolio/:itemId/images', protect, designerMiddleware, upload.array('images', 10), addPortfolioItemImages);
router.delete('/me/portfolio/:itemId', protect, designerMiddleware, deletePortfolioItem);

// Public profile by id — must be last
router.get('/:id', getDesignerById);

module.exports = router;
