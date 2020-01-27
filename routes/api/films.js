const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Film = require('../../models/Film');
const parser = require('../../library/controller');
const utilities = require('../../library/utilities');

// @route  POST api/films
// @desc   Create film
// @access Private
router.post('/', [
    auth,
    [
        check('title', 'Title is required').not().isEmpty(),
        check('type', 'Type is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
        check('link', 'Link is required').not().isEmpty(),
        check('photo', 'Photo is required').not().isEmpty(),
        check('year', 'Year is required and must be number').isNumeric().not().isEmpty()
    ]
], async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }

    try {
        const body = request.body;

        const newFilm = new Film({
            user: request.user.id,
            title: body.title,
            type: body.type.split(',').map(type => type.trim()),
            description: body.description,
            link: body.link,
            photo: body.photo,
            year: body.year
        });

        const film = await newFilm.save();
        response.json(film);
    } catch (err) {
        console.error(err.message);
        response.status(500).send('Server error');
    }
});

// @route  GET api/films
// @desc   Get all films
// @access Private
router.get('/', auth, async (request, response) => {
    try {
        const films = await Film.find().sort({ date: -1 });
        response.json(films);
    } catch (err) {
        console.error(err.message);
        response.status(500).send('Server error');
    }
});

// @route  GET api/films/id/:film_id
// @desc   Get film by film_id
// @access Private
router.get('/id/:film_id', auth, async (request, response) => {
    try {
        const film = await Film.findOne({ _id: request.params.film_id });

        if (!film) {
            return response.status(404).json({ msg: 'Film not found' });
        }

        response.json(film);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return response.status(404).json({ msg: 'Film not found' });
        }

        response.status(500).send('Server error');
    }
});

// @route  GET api/films/search?name=matrix&sortBy=name&sortOrder=-1&genre=action,drama&yearPeriod=2010,2014&limit=50&page=1
// @desc   Search film by name
// @access Private
router.get('/search', auth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const page = parseInt(req.query.page) || 0;

        let { name, sortBy, genre, yearPeriod }  = req.query;
        sortBy = sortBy || 'name';
        let yearRange = Array();
        let yearPeriodStr = yearPeriod || '';
        yearPeriod = yearPeriodStr.split(',');
        const yearFrom = parseInt(yearPeriod[0]);
        const yearTo = parseInt(yearPeriod[1]) || yearFrom;
        for (let i = yearFrom; i <= yearTo; i++) {
            yearRange.push(i);
        }
        const titleCondition = name ? { $regex: '.*' + name + '.*', $options: 'i' } : { $regex: '.*', $options: 'i' };
        // console.log(String(genre).split(','));
        let sortCondition = {};
        sortCondition[sortBy] = parseInt(req.query.sortOrder) || -1;

        let findCondition = {
            title: titleCondition,
        };

        if (genre) {
            findCondition['type'] = { $in: genre.toString().split(',') }
        }
        if (yearRange.length > 0) {
            findCondition['year'] = { $in: yearRange }
        }
        console.log(findCondition, sortCondition);
        const filmsFromDb = await Film.find(findCondition).sort(sortCondition).skip(limit * page).limit(limit);
        console.log(filmsFromDb.length);
        if (filmsFromDb.length === 0) {
            const filmsFromApi = await parser.getSearch(name);
            filmsFromApi.forEach((film) => utilities.convertApiFilmToDbFilm(film).save());
            // return res.json(filmsFromApi);
        }
        return await res.json(await Film.find(findCondition).sort(sortCondition).skip(limit * page).limit(limit));
    } catch (err) {
        await res.json({ msg: err.message });
    }
});

// @route  GET api/films/popular?page=limit=
// @desc   Get popular films
// @access Private
router.get('/popular', auth, async (req, res) => {
  try {
      const limit = parseInt(req.query.limit) || 50;
      const page = parseInt(req.query.page) || 1;

      const filmsFromDb = await Film.find().sort({ date: -1 }).skip(limit * page).limit(limit);//.limit(limit);//.find('',{},{ skip: limit * page, limit: limit });
      console.log(filmsFromDb.length);
      return res.json(filmsFromDb);
  } catch (err) {
      res.json({ msg: err.message });
  }
});

// @route  GET api/films/popular?page=
// @desc   Get popular films
// @access Private
router.get('/popular/download', auth, async (req, res) => {
   try {
       let result = [];
       const page = req.query.page;
       const filmsFromApi = await parser.getPopular(page);
       for (let filmFromApi of filmsFromApi) {
           const filmFromDb = await Film.findOne({ title: { $regex: '.*' + filmFromApi.title + '.*', $options: 'i' } });
           if (filmFromDb === null || filmFromDb.length === 0) {
               let filmToSave = utilities.convertApiFilmToDbFilm(filmFromApi);

               result.push(filmToSave);
               filmToSave.save();
           } else {
               result.push(filmFromDb);
           }
       }
       return res.json(result);
   } catch (err) {
       res.json({ msg: err.message });
   }
});

// @route  DELETE api/films/:film_id
// @desc   Delete film by film_id
// @access Private
router.delete('/:film_id', auth, async (request, response) => {
    try {
        const film = await Film.findById(request.params.film_id);
        if (!film) {
            return response.status(404).json({ msg: 'Film not found' });
        }

        // Check user
        if (film.user.toString() !== request.user.id) {
            return response.status(401).json({ msg: 'User is not authorized' });
        }
        await film.remove();

        response.json({ msg: 'Film was removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return response.status(404).json({ msg: 'Film not found' });
        }
        response.status(500).send('Server error');
    }
});

// @route  PUT api/films/like/:film_id
// @desc   Add like to film
// @access Private
router.put('/like/:film_id', auth, async (req, res) => {
    try {
        const film = await Film.findById(req.params.film_id);
        const countLikesByUser = film.likes.filter(like => like.user.toString() === req.user.id).length;
        if (film) {
            if (countLikesByUser > 0) {
                const removeIndexLike = film.likes.map(like => like.user.toString()).indexOf(req.user.id);
                film.likes.splice(removeIndexLike, 1);
            } else if (countLikesByUser === 0) {
                film.likes.unshift({ user: req.user.id });
            }
        }
        await film.save();

        res.json(film.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route  POST api/films/comment/:film_id
// @desc   Create a comment to film
// @access Private
router.post('/comment/:film_id', [
    auth,
    [
        check('text', 'Text is required').not().isEmpty()
    ]
], async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }

    try {
        const body = request.body;
        const user = await User.findById(request.user.id);
        const film = await Film.findById(request.params.film_id);

        const newComment = {
            user: request.user.id,
            text: body.text,
            authorName: user.login,
            authorAvatar: user.avatar,
        };

        film.comments.unshift(newComment);
        await film.save();
        response.json(film.comments);
    } catch (err) {
        console.error(err.message);
        response.status(500).send('Server error');
    }
});

// @route  DELETE api/films/comment/:film_id/:comment_id
// @desc   Delete comment
// @access Private
router.delete('/comment/:film_id/:comment_id', auth, async (req, res) => {
   try {
       const film = await Film.findById(req.params.film_id);
       const comment = film.comments.find(comment => comment.id === req.params.comment_id);

       if (!comment) {
           return res.status(404).json({ msg: 'Comment does not exist' });
       }

       // Check user is authorized
       if (comment.user.toString() !== req.user.id) {
           return res.status(403).json({ msg: 'User is not authorized' });
       }

       const removeIndexComment = film.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
       film.comments.splice(removeIndexComment, 1);

       await film.save();
       res.json(film.comments);
   } catch (err) {
       console.error(err.message);
       res.status(500).send('Server error');
   }
});

// @route  GET api/films/genres
// @desc   Get all genres
// @access Private
router.get('/genres', auth, (req, res) => {
   try {
       res.json([
           "drama",
           "mystery",
           "sci-fi",
           "thriller",
           "action",
           "romance",
           "adventure",
           "comedy",
           "crime",
           "fantasy",
           "horror",
           "animation",
           "family",
           "music",
           "biography",
           "western",
           "musical",
           "history",
           "war",
           "superhero",
           "documentary",
           "film-noir",
           "sport"
       ]);
   } catch (err) {
       console.error(err.message);
       res.status(500).send('Server error');
   }
});

// @route  GET api/films/genres
// @desc   Get all genres
// @access Private
router.get('/fields', auth, (req, res) => {
    try {
        res.json([
            "date",
            "year",
            "rating"
        ]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;