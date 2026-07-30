const express = require("express");
const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/uploadMiddleware");
const {
  getDesignAssistantSuggestions,
  getProjectAssistantSuggestions,
} = require("../controllers/assistant.controller");

const router = express.Router();

router.post("/", upload.localSingle("image"), getDesignAssistantSuggestions);
router.post("/project/:projectId", protect, getProjectAssistantSuggestions);

module.exports = router;
