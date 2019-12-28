const utilities = require('../library/utilities');

module.exports = function (req, res, next) {
  // get user's email  and send letter
    utilities.sendMail()
};