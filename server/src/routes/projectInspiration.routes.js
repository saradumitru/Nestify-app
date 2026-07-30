const express = require("express");

const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/uploadMiddleware");

const {
  addInspiration,
} = require("../controllers/projectInspiration.controller");

const router = express.Router();

router.post(
  "/:projectId",
  protect,
  upload.single("image"),
  addInspiration
);

module.exports = router;