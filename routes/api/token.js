const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');
const passport =  require('passport');


router.get('/insta/:token', (req, res) => {
    const token = req.params.token;
    if (token) {
        return res.json({ token: token });
    } else {
        return res.json({ msg: "No token" });
    }
});

router.get('/42/:token', (req, res) => {
    const token = req.params.token;
    if (token) {
        return res.json({ token: token });
    } else {
        return res.json({ msg: "No token" });
    }
});

module.exports = router;