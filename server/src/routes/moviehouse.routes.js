const express = require('express');
const protect = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getAllMovieHouses, getMovieHouseBySlug, createMovieHouse,
  addMovieHouseGalleryImage, updateMovieHouse, deleteMovieHouseGalleryPhoto, deleteMovieHouse,
  createMovieLocation, updateMovieLocation, deleteMovieLocation,
  addLocationGalleryImage, deleteLocationGalleryPhoto,
} = require('../controllers/moviehouse.controller');

const router = express.Router();

// Movie house CRUD
router.get('/', getAllMovieHouses);
router.get('/:slug', getMovieHouseBySlug);
router.post('/', protect, adminMiddleware, upload.single('image'), createMovieHouse);
router.put('/:id', protect, adminMiddleware, upload.single('image'), updateMovieHouse);
router.post('/:id/gallery', protect, adminMiddleware, upload.single('image'), addMovieHouseGalleryImage);
router.delete('/:id/gallery/:index', protect, adminMiddleware, deleteMovieHouseGalleryPhoto);
router.delete('/:id', protect, adminMiddleware, deleteMovieHouse);

// Locations CRUD
router.post('/:id/locations', protect, adminMiddleware, upload.single('image'), createMovieLocation);
router.put('/:id/locations/:locId', protect, adminMiddleware, upload.single('image'), updateMovieLocation);
router.delete('/:id/locations/:locId', protect, adminMiddleware, deleteMovieLocation);
router.post('/:id/locations/:locId/gallery', protect, adminMiddleware, upload.single('image'), addLocationGalleryImage);
router.delete('/:id/locations/:locId/gallery/:index', protect, adminMiddleware, deleteLocationGalleryPhoto);

module.exports = router;
