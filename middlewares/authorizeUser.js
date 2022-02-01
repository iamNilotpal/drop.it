const JWT = require('jsonwebtoken');
const User = require('../models/user');
const Session = require('../models/session');
const { allowLogUserIn } = require('../helpers/logUserIn');
const { clearUserAccessAndRefreshTokens } = require('../helpers/clearCookies');

async function authorizeUser(req, res, next) {
  try {
    if (req?.cookies?.uidAccessToken) {
      const { uidAccessToken } = req.cookies;
      const { sessionToken, userId } = JWT.verify(
        uidAccessToken,
        process.env.JWT_SIGNATURE
      );

      if (sessionToken && userId) {
        const userSession = await Session.findOne({ sessionToken });
        if (userSession) {
          const user = await User.findOne({ _id: userId });
          if (!user) {
            await clearUserAccessAndRefreshTokens(res);
            await userSession.remove();
            return res.status(401).render('errors/userUnauthorized');
          }

          if (user.role === 'User') return next(user, req, res, next);
          else {
            clearUserAccessAndRefreshTokens(res);
            return res.status(403).render('errors/forbidden');
          }
        }
        await clearUserAccessAndRefreshTokens(res);
        return res.status(401).render('errors/userUnauthorized');
      }
    }

    if (req?.cookies?.uidRefreshToken) {
      const { uidRefreshToken } = req.cookies;
      const { sessionToken } = JWT.verify(
        uidRefreshToken,
        process.env.JWT_SIGNATURE
      );

      if (sessionToken) {
        const userSession = await Session.findOneAndDelete({ sessionToken });
        if (userSession) {
          const user = await User.findOne({ _id: userSession.userId });
          if (!user) {
            await clearUserAccessAndRefreshTokens(res);
            await userSession.remove();
            return res.status(401).render('errors/userUnauthorized');
          }

          if (user.role === 'User') {
            await allowLogUserIn(user._id, req, res);
            return next(user, req, res, next);
          } else {
            clearUserAccessAndRefreshTokens(res);
            return res.status(403).render('errors/forbidden');
          }
        }
        await clearUserAccessAndRefreshTokens(res);
        return res.status(401).render('errors/userUnauthorized');
      }
    }
    return res.status(401).render('errors/userUnauthorized');
  } catch (error) {
    await clearUserAccessAndRefreshTokens(res);
    return res.status(401).render('errors/userUnauthorized');
  }
}

module.exports = authorizeUser;
