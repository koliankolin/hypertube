const utilities = require('../library/utilities');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  // get user's email  and send letter
    const user = await User.findById(req.user.id);

    await utilities.sendMailChangePassword(user.email, user.login, user.lang);
    next();
};