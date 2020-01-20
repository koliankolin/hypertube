const mongoose = require('mongoose');
const FilmSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    imdb_code: {
        type: String
    },
    title: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: [String],
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    rating: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            },
            mark: {
                type: Number,
                required: true
            }
        }
    ],
    rating_imdb: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    photo: {
        type: String,
        required: true
    },
    torrents: [
        {
            url: {
                type: String
            },
            magnet: {
                type: String
            },
            quality: {
                type: String
            },
            lang: {
                type: String
            },
            seeds: {
                type: Number
            },
            peers: {
                type: Number
            },
            size: {
                type: String
            },
            hash: {
                type: String
            }
        }
    ],
    likes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    ],
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            },
            text: {
                type: String,
                required: true
            },
            authorName: {
                type: String
            },
            authorAvatar: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Film = mongoose.model('film', FilmSchema);