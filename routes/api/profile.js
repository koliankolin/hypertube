const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route  GET api/profile/me
// @desc   Get current user's profile
// @access Private
router.get('/me', auth, async (request, response) => {
    try {
        const profile = await Profile.findOne({ user: request.user.id })
            .populate('user',
                [
                    'firstName',
                    'lastName',
                    'avatar'
                ]);
        if (!profile) {
            return response.status(400).json({ msg: 'There is no profile for that user' });
        }

        response.json(profile);
    } catch (err) {
        console.error(err.message);
        response.status(500).send('Server error');
    }
});

// @route  GET api/profile
// @desc   Create or update user's profile
// @access Private
router.post('/', auth, async (request, response) => {
    const {
        favourite_films,
        bio,
        github,
        school42
    } = request.body;

    // Build a profile object
    const profileFields = {};
    profileFields.user = request.user.id;
    if (favourite_films) {
        profileFields.favourite_films = favourite_films.split(',').map(film => film.trim());
    }
    if (bio) profileFields.bio = bio;

    // Build a social object
    profileFields.social = {};
    if (github) profileFields.social.github = github;
    if (school42) profileFields.social.school42 = school42;

    try {
        let profile = await Profile.findOne({ user: request.user.id });

        if (profile) {
            // update
            profile = await Profile.findOneAndUpdate(
                { user: request.user.id },
                { $set: profileFields },
                { new: true });
            return response.json(profile);
        }

        // create
        profile = new Profile(profileFields);
        await profile.save();
        response.json(profile);
    } catch (err) {
        console.error(err.message);
        response.status(500).send('Server error');
    }
});

module.exports = router;