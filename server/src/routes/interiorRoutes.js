const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getInteriorsByRoomType,
  getInteriorBySlug,
  createInterior,
  updateInterior,
  deleteInterior,
  createInteriorObject,
  updateInteriorObject,
  deleteInteriorObject,
  addProductLink,
  addInteriorGalleryImage,
  deleteInteriorGalleryPhoto,
  addInteriorGalleryObject,
  deleteInteriorGalleryObject,
} = require("../controllers/interiorController");

router.get("/", getInteriorsByRoomType);
router.get("/:slug", getInteriorBySlug);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  createInterior
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  updateInterior
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteInterior
);

router.post(
  "/:id/gallery",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  addInteriorGalleryImage
);

router.delete(
  "/:id/gallery/:photoId",
  authMiddleware,
  adminMiddleware,
  deleteInteriorGalleryPhoto
);

router.post(
  "/:id/gallery/:photoId/objects",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  addInteriorGalleryObject
);

router.delete(
  "/:id/gallery/:photoId/objects/:objectId",
  authMiddleware,
  adminMiddleware,
  deleteInteriorGalleryObject
);

router.post(
  "/:interiorId/objects",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  createInteriorObject
);

router.put(
  '/objects/:objectId',
  authMiddleware,
  adminMiddleware,
  upload.single('image'),
  updateInteriorObject
);

router.delete(
  '/objects/:objectId',
  authMiddleware,
  adminMiddleware,
  deleteInteriorObject
);

router.post(
  '/objects/:objectId/links',
  authMiddleware,
  adminMiddleware,
  addProductLink
);

module.exports = router;