const { logAdminOut } = require('../../helpers/logoutUser');
const {
  clearAdminAccessAndRefreshTokens,
} = require('../../helpers/clearCookies');

async function logOutAdmin(user, req, res, next) {
  try {
    await logAdminOut(req, res, next);
    return res.status(200).json({
      message: 'Logged Out. Redirecting To Login Page.',
      redirectUrl: `https://${process.env.ROOT_DOMAIN}/admin/auth/login`,
    });
  } catch (error) {
    await clearAdminAccessAndRefreshTokens(res);
    return res.status(200).json({
      message: 'Something went wrong. Logging Out.',
      redirectUrl: `https://${process.env.ROOT_DOMAIN}/admin/auth/login`,
    });
  }
}

module.exports = logOutAdmin;
