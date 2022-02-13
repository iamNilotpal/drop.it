const { logAdminOut } = require('../../helpers/logoutUser');
const {
  clearAdminAccessAndRefreshTokens,
} = require('../../helpers/clearCookies');
const Session = require('../../models/session');

async function logOutAdmin(user, req, res, next) {
  try {
    await logAdminOut(req, res, next);
    return res.status(200).json({
      message: 'Logged Out. Redirecting To Login Page.',
      redirectUrl: `${process.env.ROOT_DOMAIN}/admin/auth/login`,
    });
  } catch (error) {
    await clearAdminAccessAndRefreshTokens(res);
    return res.status(200).json({
      message: 'Something went wrong. Logging Out.',
      redirectUrl: `${process.env.ROOT_DOMAIN}/admin/auth/login`,
    });
  }
}

async function logoutFromAll(user, req, res, next) {
  try {
    await Session.deleteMany({ userId: user._id });
    clearAdminAccessAndRefreshTokens(res);
    return res.status(200).json({
      message: 'Logged Out. Redirecting To Login Page.',
      redirectUrl: `${process.env.ROOT_DOMAIN}/admin/auth/login`,
    });
  } catch (error) {
    await clearAdminAccessAndRefreshTokens(res);
    return res.status(200).json({
      message: 'Something went wrong. Logout failed.',
      redirectUrl: `${process.env.ROOT_DOMAIN}/auth/login`,
    });
  }
}

module.exports = { logOutAdmin, logoutFromAll };
