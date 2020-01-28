const jwt = require('jsonwebtoken');
const config = require('config');

const   passport =          require('passport'),
    FortyTwoStrategy =  require('passport-42').Strategy,
    InstagramStrategy = require('passport-instagram').Strategy;

const User = require('../models/User');

module.exports = function (request, response, next) {
    // Get token from header
    const token = request.header('x-auth-token');

    // Check if no token
    if (!token) {
        response.status(401).json({ msg: 'No token, authorization denied' })
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        request.user = decoded.user;
        next();
    } catch (err) {
        response.status(401).json({ msg: 'Token is not valid' });
    }
};

passport.use(new FortyTwoStrategy({
        clientID: config.get('APP_ID_42'),
        clientSecret: config.get('APP_SECRET_42'),
        callbackURL: '/api/auth/42/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser =  await User.findOne({ fortyTwoId: profile.id});

            if (existingUser){
                return done(null, existingUser);
            }
            const user = await new User({
                login: profile._json.login,
                firstName: profile._json.first_name,
                lastName: profile._json.last_name,
                email: profile._json.email,
                avatar: profile._json.image_url,
                fortyTwoId: profile._json.id,
            }).save();
            done(null, user);
        } catch (err) {
            return done(null, false);
        }
    }
));

passport.use(new InstagramStrategy({
        clientID: config.get('APP_ID_INSTA'),
        clientSecret: config.get('APP_SECRET_INSTA'),
        callbackURL: '/api/auth/insta/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser =  await User.findOne({ fortyTwoId: profile.id});

            if (existingUser){
                return done(null, existingUser);
            }
            const user = await new User({
                login: profile._json.login,
                firstName: profile._json.first_name,
                lastName: profile._json.last_name,
                email: profile._json.email,
                avatar: profile._json.image_url,
                instaId: profile._json.id,
            }).save();
            done(null, user);
        } catch (err) {
            return done(null, false);
        }
    }
));