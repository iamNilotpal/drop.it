const Session = require('../models/session');
const {
  clearUserAccessAndRefreshTokens,
  clearAdminAccessAndRefreshTokens,
} = require('./clearCookies');
const JWT = require('jsonwebtoken');

async function logUserOut(req, res) {
  try {
    if (req?.cookies?.uidAccessToken) {
      const { uidAccessToken } = req.cookies;
      const { sessionToken } = JWT.verify(
        uidAccessToken,
        process.env.JWT_SIGNATURE
      );
      await Session.deleteOne({ sessionToken });
    }

    if (req?.cookies?.uidRefreshToken) {
      const { uidRefreshToken } = req.cookies;
      const { sessionToken } = JWT.verify(
        uidRefreshToken,
        process.env.JWT_SIGNATURE
      );
      await Session.deleteOne({ sessionToken });
    }
    await clearUserAccessAndRefreshTokens(res);
    return;
  } catch (error) {
    await clearUserAccessAndRefreshTokens(res);
    return res.status(400).redirect('/auth/login');
  }
}

async function logAdminOut(req, res) {
  try {
    if (req?.cookies?.aidAccessToken) {
      const { aidAccessToken } = req.cookies;
      const { sessionToken } = JWT.verify(
        aidAccessToken,
        process.env.JWT_SIGNATURE
      );
      await Session.deleteOne({ sessionToken });
    }

    if (req?.cookies?.aidRefreshToken) {
      const { aidRefreshToken } = req.cookies;
      const { sessionToken } = JWT.verify(
        aidRefreshToken,
        process.env.JWT_SIGNATURE
      );
      await Session.deleteOne({ sessionToken });
    }
    await clearAdminAccessAndRefreshTokens(res);
    return;
  } catch (error) {
    await clearAdminAccessAndRefreshTokens(res);
    return res.status(400).redirect('/admin/auth/login');
  }
}

module.exports = { logUserOut, logAdminOut };
