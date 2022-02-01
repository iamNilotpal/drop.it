const httpErrors = require('http-errors');

async function userSettings(user, req, res, next) {
  try {
    return res.status(200).json({
      ok: true,
      username: user.username,
      email: user.email.address,
    });
  } catch (error) {
    return next(httpErrors.InternalServerError('Something went wrong.'));
  }
}

module.exports = userSettings;
