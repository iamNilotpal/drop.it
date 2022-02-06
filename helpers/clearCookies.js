module.exports.clearUserAccessAndRefreshTokens = async function (res) {
  try {
    res.clearCookie('uidAccessToken', { path: '/' });
    res.clearCookie('uidRefreshToken', { path: '/' });
  } catch (error) {
    throw new Error('Something Went Wrong. Please Try Again Later...!!!');
  }
};

module.exports.clearAdminAccessAndRefreshTokens = async function (res) {
  try {
    res.clearCookie('aidAccessToken', { path: '/' });
    res.clearCookie('aidRefreshToken', { path: '/' });
  } catch (error) {
    throw new Error('Something Went Wrong. Please Try Again Later...!!!');
  }
};
