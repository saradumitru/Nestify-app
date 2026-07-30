const express = require("express");

const protect = require("../middleware/auth.middleware");

const {
  createTask,
  toggleTask,
} = require("../controllers/projectTask.controller");

const router = express.Router();

router.post("/:projectId", protect, createTask);
router.patch("/:id/toggle", protect, toggleTask);

module.exports = router;