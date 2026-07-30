const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getStyles,
  getStyleBySlug,
  createStyle,
  updateStyle,
  deleteStyle,
} = require("../controllers/styleController");

router.get("/", getStyles);
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

module.exports = router;