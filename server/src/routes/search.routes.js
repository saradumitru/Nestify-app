const express = require('express');
const { searchAll, getFilterOptions } = require('../controllers/search.controller');

const router = express.Router();

router.get('/', searchAll);
router.get('/filters', getFilterOptions);

module.exports = router;