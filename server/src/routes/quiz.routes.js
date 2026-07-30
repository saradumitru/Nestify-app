const express = require("express");
const protect = require("../middleware/auth.middleware");

const {
  saveQuizResult,
  getQuizResults,
} = require("../controllers/quiz.controller");

const router = express.Router();

router.post("/results", protect, saveQuizResult);
router.get("/results", protect, getQuizResults);

module.exports = router;