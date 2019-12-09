const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');

const User = require('../../models/User');

// @route  POST api/users
// @desc   Register user
// @access Public
router.post('/', [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('login', 'Login name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter password with 6 or more characters').isLength({ min: 6})
], async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).json({ errors: errors.array() });
    }

    const {firstName, lastName, login, email, password} = request.body;
    
    try {
        // See if user exists
        let userEmail = await User.findOne({ email });
        let userLogin = await User.findOne({ login });
        if (userEmail) {
            response.status(400).json({ errors: [{msg: 'This email is occupied'}] })
        }
        if (userLogin) {
            response.status(400).json({ errors: [{msg: 'This login is occupied'}] })
        }
        // Get user gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        });

        user = new User({
           firstName,
           lastName,
           login,
           email,
           password,
           avatar
        });

        // Encrypt password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);
        await user.save();
        // Return jsonwebtoken

        response.send('User registered');
    } catch (err) {
        console.log(err.message);
        response.status(500).send('Server error');
    }

});

module.exports = router;