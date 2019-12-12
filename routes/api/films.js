const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Film = require('../../models/Film');

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

// @route  GET api/films/:film_id
// @desc   Get film by film_id
// @access Private
router.get('/:film_id', auth, async (request, response) => {
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

module.exports = router;