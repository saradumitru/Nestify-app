const express = require("express");
const protect = require("../middleware/auth.middleware");
const { getProjects, createProject, deleteProject } = require("../controllers/project.controller");

const router = express.Router();

router.get("/", protect, getProjects);
router.post("/", protect, createProject);
router.delete("/:id", protect, deleteProject);

module.exports = router;
