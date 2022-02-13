const { logUserOut } = require('../../helpers/logoutUser');
const {
  clearUserAccessAndRefreshTokens,
} = require('../../helpers/clearCookies');
const Session = require('../../models/session');

async function logOutUser(user, req, res, next) {
  try {
    await logUserOut(req, res);
    return res.status(200).json({
      message: 'Logged Out. Redirecting To Login Page.',
      redirectUrl: `${process.env.ROOT_DOMAIN}/auth/login`,
    });
  } catch (error) {
    await clearUserAccessAndRefreshTokens(res);
    return res.status(200).json({
      message: 'Something went wrong. Logging Out.',
      redirectUrl: `${process.env.ROOT_DOMAIN}/auth/login`,
    });
  }
}

async function logoutFromAll(user, req, res, next) {
  try {
    await Session.deleteMany({ userId: user._id });
    clearUserAccessAndRefreshTokens(res);
    return res.status(200).json({
      message: 'Logged Out. Redirecting To Login Page.',
      redirectUrl: `${process.env.ROOT_DOMAIN}/auth/login`,
    });
  } catch (error) {
    await clearUserAccessAndRefreshTokens(res);
    return res.status(200).json({
      message: 'Something went wrong. Logout failed.',
      redirectUrl: `${process.env.ROOT_DOMAIN}/auth/login`,
    });
  }
}

module.exports = { logOutUser, logoutFromAll };
