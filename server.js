const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const passport = require('passport');

const app = express();
// connect db
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

app.use(passport.initialize({}));
app.use(passport.session({}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// define routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/films', require('./routes/api/films'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/parser', require('./routes/api/parser'));
app.use('/api/subtitles', require('./routes/api/subtitles'));
app.use('/api/translate', require('./routes/api/translate'));
app.use('/api/token', require('./routes/api/token'));

const PORT = process.env.PORT || 5000;

app.get('/', (request, response) => response.send('API running'));
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));