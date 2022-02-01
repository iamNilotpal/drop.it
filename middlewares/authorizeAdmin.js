const JWT = require('jsonwebtoken');
const Admin = require('../models/admin');
const Session = require('../models/session');
const { allowLogAdminIn } = require('../helpers/logUserIn');
const { clearAdminAccessAndRefreshTokens } = require('../helpers/clearCookies');

async function authorizeAdmin(req, res, next) {
  try {
    if (req?.cookies?.aidAccessToken) {
      const { aidAccessToken } = req.cookies;
      const { sessionToken, userId } = JWT.verify(
        aidAccessToken,
        process.env.JWT_SIGNATURE
      );

      if (sessionToken && userId) {
        const adminSession = await Session.findOne({ sessionToken }).exec();
        if (adminSession) {
          const user = await Admin.findOne({ _id: userId }).exec();
          if (!user) {
            await clearAdminAccessAndRefreshTokens(res);
            await adminSession.remove();
            return res.status(401).render('errors/adminUnauthorized');
          }

          if (user.role === 'Admin') return next(user, req, res, next);
          else {
            clearAdminAccessAndRefreshTokens(res);
            return res.status(403).render('errors/forbidden');
          }
        }

        await clearAdminAccessAndRefreshTokens(res);
        return res.status(401).render('errors/adminUnauthorized');
      }
    }

    if (req?.cookies?.aidRefreshToken) {
      const { aidRefreshToken } = req.cookies;
      const { sessionToken } = JWT.verify(
        aidRefreshToken,
        process.env.JWT_SIGNATURE
      );

      if (sessionToken) {
        const userSession = await Session.findOneAndDelete({
          sessionToken,
        }).exec();
        if (userSession) {
          const user = await Admin.findOne({ _id: userSession.userId }).exec();
          if (!user) {
            await clearAdminAccessAndRefreshTokens(res);
            await userSession.remove();
            return res.status(401).render('errors/adminUnauthorized');
          }

          if (user.role === 'Admin') {
            await allowLogAdminIn(user._id, req, res);
            return next(user, req, res, next);
          } else {
            clearAdminAccessAndRefreshTokens(res);
            return res.status(403).render('errors/forbidden');
          }
        }
        await clearAdminAccessAndRefreshTokens(res);
        return res.status(401).redirect('/admin/auth/login');
      }
    }
    return res.status(401).render('errors/adminUnauthorized');
  } catch (error) {
    await clearAdminAccessAndRefreshTokens(res);
    return res.status(401).render('errors/adminUnauthorized');
  }
}

module.exports = authorizeAdmin;
