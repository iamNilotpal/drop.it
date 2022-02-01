async function isUserLoggedIn(req, res, next) {
  if (req?.cookies?.uidAccessToken || req?.cookies?.uidRefreshToken) {
    return res.redirect('/user/dashboard');
  }
  return next();
}

async function isAdminLoggedIn(req, res, next) {
  if (req?.cookies?.aidAccessToken || req?.cookies?.aidRefreshToken) {
    return res.redirect('/admin/dashboard');
  }
  return next();
}

module.exports = { isUserLoggedIn, isAdminLoggedIn };
