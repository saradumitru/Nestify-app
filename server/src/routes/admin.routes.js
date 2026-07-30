const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const adminMiddleware = require("../middleware/admin.middleware");

const { getAdminStats } = require("../controllers/admin.controller");

const router = express.Router();

router.get("/stats", authMiddleware, adminMiddleware, getAdminStats);

module.exports = router;