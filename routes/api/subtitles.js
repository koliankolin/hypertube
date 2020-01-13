const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const sub = require('../../library/subtitles');

// @route  GET api/subtitles?imdb=
// @desc   Get subtitles for film with imdb_code
// @access Private
router.get('/', auth, sub.searchSub);

module.exports = router;