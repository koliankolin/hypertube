const utilities = require('../library/utilities');

module.exports = async function (req, res, next) {
    // get user's email  and send letter
    try {
        const {email, login} = req.body;

        await utilities.sendEmailRegister(email, login);
        console.log(email, login);
        console.log('Email was sent');
        next();
    } catch (err) {
        res.json({ msg: err.message })
    }
};