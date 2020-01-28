const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');
const passport =  require('passport');

const User = require('../../models/User');

const createToken = (user, local) => {
    return jwt.sign({id: user._id, mail:user.email,local}, config.get('jwtSecret'), { expiresIn: '6h' })
};

router.route('/42') //42 Auth
    .get(passport.authenticate('42'));

router.route('/42/callback')
    .get(passport.authenticate('42', {failureRedirect: '/'}), (req, res) => {
        res.redirect('/');
    });

router.route('/insta') //42 Auth
    .get(passport.authenticate('instagram'));

router.route('/insta/callback')
    .get(passport.authenticate('42', {failureRedirect: '/'}), (req, res) => {
        res.redirect('/');
    });

// @route  GET api/auth
// @desc   Get auth user
// @access Public
router.get('/', auth, async (request, response) =>
    {
        try {
            const user = await User.findById(request.user.id).select('-password');
            response.json(user);
        } catch (err) {
            console.error(err.message);
            response.status(500).send('Server error');
        }
    }
);

// @route  POST api/auth
// @desc   Authenticate user & get token
// @access Public
router.post('/', [
    check('login', 'Login name is required').not().isEmpty(),
    check(
        'password',
        'Password is required'
    ).exists()
], async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }

    const {login, password} = request.body;

    try {
        // See if user exists
        let user = await User.findOne({ login });
        if (!user) {
            return response.status(400).json({ errors: [{msg: 'Invalid credentials'}] })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return response.status(400).json({ errors: [{msg: 'Invalid credentials'}] })
        }

        const token = await createToken(user, false);

        response.json({ token });
    } catch (err) {
        console.log(err.message);
        response.status(500).send('Server error');
    }

});

module.exports = router;