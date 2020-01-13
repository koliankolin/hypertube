const mongoose = require('mongoose');
const SubtitleSchema = new mongoose.Schema({
    movie_imdb: { type: String, require: true, unique: true },
    files: [
        {
            path: String,
            lang: String,
        }
    ]
});

module.exports = Subtitle = mongoose.model('subtitle', SubtitleSchema);