const utilities = require('../library/utilities');

module.exports = async function (req, res, next) {
    // get user's email  and send letter
    const {email, login} = req.body;

    await utilities.sendEmailRegister(email, login);
    next();
};