const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getStyles,
  getStyleBySlug,
  getRecommendedStyles,
  getPersonalizedStyles,
  createStyle,
  updateStyle,
  deleteStyle,
  addStyleGalleryImage,
  deleteStyleGalleryPhoto,
  addGalleryPhotoObject,
  deleteGalleryPhotoObject,
} = require("../controllers/styleController");

router.get("/", getStyles);
router.get("/personalized", authMiddleware, getPersonalizedStyles);
router.get("/recommendations/:slug", getRecommendedStyles);
router.get("/:slug", getStyleBySlug);


router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  createStyle
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  updateStyle
);

router.delete("/:id", authMiddleware, adminMiddleware, deleteStyle);

router.post(
  "/:id/gallery",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  addStyleGalleryImage
);

router.delete(
  "/:id/gallery/:photoId",
  authMiddleware,
  adminMiddleware,
  deleteStyleGalleryPhoto
);

router.post(
  "/:id/gallery/:photoId/objects",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  addGalleryPhotoObject
);

router.delete(
  "/:id/gallery/:photoId/objects/:objectId",
  authMiddleware,
  adminMiddleware,
  deleteGalleryPhotoObject
);

module.exports = router;
