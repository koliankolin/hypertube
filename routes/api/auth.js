const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');

const User = require('../../models/User');

// @route  GET api/auth
// @desc   Test route
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


        // Return jsonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        };

        await jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 3600 },
            (err, token) =>
            {
                if (err) throw err;
                response.json({ token });
            });

        // response.send('User registered');
    } catch (err) {
        console.log(err.message);
        response.status(500).send('Server error');
    }

});

module.exports = router;