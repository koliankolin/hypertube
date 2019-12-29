const utilities = require('../library/utilities');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  // get user's email  and send letter
    try {
        const user = await User.findById(req.user.id);

        await utilities.sendMailChangePassword(user.email, user.login, user.lang);
        console.log(user.email, user.login);
        console.log('Email was sent');
        next();
    } catch (err) {
        res.json({ msg: err.message })
    }
};