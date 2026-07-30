const express = require('express');
const protect = require('../middleware/auth.middleware');
const optionalAuth = require('../middleware/optional.auth.middleware');
const {
  getMoodboards,
  getMoodboardById,
  createMoodboard,
  deleteMoodboard,
  addMoodboardItem,
  removeMoodboardItem,
  generateShareLink,
  getPublicMoodboard,
  getPublicMoodboards,
  toggleMoodboardLike,
} = require('../controllers/moodboard.controller');

const router = express.Router();

router.get('/', protect, getMoodboards);
router.get('/discover', optionalAuth, getPublicMoodboards);
router.get('/public/:shareId', optionalAuth, getPublicMoodboard);
router.get('/:id', protect, getMoodboardById);
router.post('/', protect, createMoodboard);
router.delete('/:id', protect, deleteMoodboard);
router.post('/:id/items', protect, addMoodboardItem);
router.delete('/:id/items/:imageId', protect, removeMoodboardItem);
router.post('/:id/share', protect, generateShareLink);
router.post('/:id/like', protect, toggleMoodboardLike);

module.exports = router;
