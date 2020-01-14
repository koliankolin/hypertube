const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const translate = require('../../library/translate');

// @route  POST api/translate
// @desc   Get translate from text
// @access Private
router.post('/', auth, translate.translate);

module.exports = router;