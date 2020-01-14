const mongoose = require('mongoose');
const SubtitleSchema = new mongoose.Schema({
    imdb_code: { type: String, require: true, unique: true },
    files: [
        {
            path: String,
            lang: String,
        }
    ]
});

module.exports = Subtitle = mongoose.model('subtitle', SubtitleSchema);