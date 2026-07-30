const express = require('express');
const protect = require('../middleware/auth.middleware');
const {
  toggleFavorite,
  getFavorites,
} = require('../controllers/favorite.controller');

const router = express.Router();

router.post('/', protect, toggleFavorite);
router.get('/', protect, getFavorites);

module.exports = router;