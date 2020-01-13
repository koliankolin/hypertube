const nodemailer = require('nodemailer');
const Film = require('../models/Film');

const transporter = nodemailer.createTransport({
    pool: true,
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
        user: "stanislav.gorchakov.1@gmail.com",
        pass: "koliankolin"
    }
});
const User = require('../models/User');

//FUNCTIONS VALIDATE INPUT BEFORE CHECK MONGOOSE
exports.checkInfo = async function(type, str, str2) {
    let error = null;

    if (str.length === 0)
        return ('empty');
    if (type === 'mail')
    {
        if (str.length > 250)
            error = 'length';
        else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]{2,}\.[a-z]{2,4}$/.test(str))
            error = "format";
        else if (await User.findOne({mail: str}).exec())
            error = 'alreadyTaken';
    }
    else if (type === 'password')
    {
        if (str.length > 30)
            error = 'length';
        else if (!(str.match(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).{6,}$/)))
            error = 'format';
    }
    else if (type === 'cfpassword' && str !== str2)
        error = 'diff';
    else
    {
        if (str.length > 50)
            return ('length');
        if (type === 'username')
        {
            if (/\W/.test(str))
                error = 'format';
            else if (await User.findOne({username: str}).exec())
                error = 'alreadyTaken';
        }
        else if (type === 'lastname')
        {
            if (!(str.match(/^[a-zA-Z ]+$/)))
                error = 'format';
            else if (str.match(/(^\s|\s$|\s[\s]+)/))
                error = 'format';
        }
        else if (type === 'firstname')
        {
            if (!(str.match(/^[a-zA-Z-]+$/)))
                error = 'format';
            else if (str.match(/(^-|-$|-[-]+)/))
                error = 'format';
        }
    }
    return (error);
};

exports.sendMailChangePassword = async function(email, username, lang) {
        if (lang === 'eng') {
            transporter.sendMail({
                from: '"Hypertube" Hypertube@hypertube.com',
                to: email,
                subject: 'Request to reset the password',
                text: `Hello ${username},\n`
                    + "It happens to everyone to forget his password.\n"
                    + "Go, click on this link or copy it in the search bar,\n"
                    + "and here we go again for the fantastic stream,\n"
                    + `http://localhost:3000/motdepasse`
            }, (err, info) => {
                if (process.env.MODE === 'DEV')
                    if (err)
                        console.error(err);
            });
        } else {
            transporter.sendMail({
                from: '"Hypertube" Hypertube@hypertube.com',
                to: email,
                subject: 'Demande de réinitialisation du mot de passe',
                text: `Bonjour ${username},\n`
                    + "Ça arrive à tout le monde d'oublier son mot de passe.\n"
                    + "Allez, clique sur ce lien ou copie le dans la barre de recherche,\n"
                    + "Et c'est reparti pour du super stream,\n"
                    + `http://localhost:3000/motdepasse`
            }, (err, info) => {
                if (process.env.MODE === 'DEV')
                    if (err)
                        console.error(err);
            });
        }
};
module.exports.sendEmailRegister = async function (email, username) {
    transporter.sendMail({
        from: '"Hypertube" Hypertube@hypertube.com',
        to: email,
        subject: 'Activating your account for Hypertube',
        text: `Hello ${username},\n`
            + "Click on this link or copy it in the search bar,\n"
            + "to connect and enjoy Hypertube!\n"
            + `http://localhost:3000/activer/`
    }, (err, info) => {
        if (process.env.MODE === 'DEV')
            if (err)
                console.error(err);
    });
};

module.exports.convertApiFilmToDbFilm = function (filmApi) {
    const {imdb, title, year, synopsis, image, genre, ratings, torrents } = filmApi;
    return new Film({
        imdb_code: imdb,
        title: title,
        type: genre,
        year: year,
        rating_imdb: ratings.Value,
        description: synopsis,
        photo: image,
        torrents: torrents
    })
};