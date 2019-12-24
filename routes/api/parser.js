const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const ctrl = require('../../library/controller');

/**
 * ALL THEESE ROUTE RETURNS A TAB OF OBJECTS OF SCRAPPED MOVIE
 **/

router.get('/popular', auth, ctrl.getPopular);
router.get('/lastadded', auth, ctrl.getLastAdded);
/**
 * For theese two :
 query :
 - page [optionnal] => if not === 1, to scrap results pages
 **/

router.get('/random', auth, ctrl.getRandom);

router.get('/search', auth, ctrl.getSearch);
/**
 *
 query :
 - name [required] => name of the movie, else => 42
 **/


module.exports = router;