module.exports.clearUserAccessAndRefreshTokens = async function (res) {
  try {
    res.clearCookie('uidAccessToken', {
      path: '/',
      domain: process.env.ROOT_DOMAIN,
    });

    res.clearCookie('uidRefreshToken', {
      path: '/',
      domain: process.env.ROOT_DOMAIN,
    });
  } catch (error) {
    throw new Error('Something Went Wrong. Please Try Again Later...!!!');
  }
};

module.exports.clearAdminAccessAndRefreshTokens = async function (res) {
  try {
    res.clearCookie('aidAccessToken', {
      path: '/',
      domain: process.env.ROOT_DOMAIN,
    });

    res.clearCookie('aidRefreshToken', {
      path: '/',
      domain: process.env.ROOT_DOMAIN,
    });
  } catch (error) {
    throw new Error('Something Went Wrong. Please Try Again Later...!!!');
  }
};
