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

// @route  GET api/films/search?name=
// @desc   Search film by name
// @access Private
router.get('/search', auth, async (req, res) => {
    try {
        const filmName = req.query.name;
        const filmsFromDb = await Film.find({ title: { $regex: '.*' + filmName + '.*', $options: 'i' } });
        if (filmsFromDb.length === 0) {
            const filmsFromApi = await parser.getSearch(filmName);
            filmsFromApi.forEach(film => utilities.convertApiFilmToDbFilm(film).save());
            return res.json(filmsFromApi);
        }
        return res.json(filmsFromDb);
    } catch (err) {
        res.json({ msg: err.message });
    }
});

// @route  GET api/films/popular?page=
// @desc   Get popular films
// @access Private
router.get('/popular', auth, async (req, res) => {
   try {
       let result = [];
       const page = req.query.page;
       const filmsFromApi = await parser.getPopular(page);
       filmsFromApi.forEach((filmFromApi) => {
           let filmFromDb = Film.find({ title: { $regex: '.*' + filmFromApi.title + '.*', $options: 'i' } });
           // console.log(filmFromDb.length);
           // return;
           if (!filmFromDb) {
               let filmToSave = utilities.convertApiFilmToDbFilm(filmFromApi);

               result.push(filmToSave);
               filmToSave.save();
           } else {
               result.push(filmFromDb);
           }
       });
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


module.exports = router;