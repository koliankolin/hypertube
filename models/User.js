const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    login: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String
    },
    avatar: {
        type: String
    },
    lang: {
        type: String
    },
    fortyTwoId: {
        type: String
    },
    instaId: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = User = mongoose.model('user', UserSchema);