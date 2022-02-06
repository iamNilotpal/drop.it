const generateAccessAndRefreshTokens = require('../services/generateTokens');

async function allowLogUserIn(userId, req, res) {
  try {
    const connectionInfo = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      userId,
      connectionInfo
    );

    res.cookie('uidAccessToken', accessToken, {
      path: '/',
      // domain: '.herokuapp.com',
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    });

    res.cookie('uidRefreshToken', refreshToken, {
      path: '/',
      // domain: '.herokuapp.com',
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  } catch (error) {
    throw new Error('Somehting Went Wrong. Please Try Again Later...!!!');
  }
}

async function allowLogAdminIn(userId, req, res) {
  try {
    const connectionInfo = {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      userId,
      connectionInfo
    );

    res.cookie('aidAccessToken', accessToken, {
      path: '/',
      // domain: process.env.ROOT_DOMAIN,
      sameSite: 'none',
      secure: true,
      httpOnly: true,
    });

    res.cookie('aidRefreshToken', refreshToken, {
      path: '/',
      // domain: process.env.ROOT_DOMAIN,
      sameSite: 'none',
      secure: true,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  } catch (error) {
    throw new Error('Somehting Went Wrong. Please Try Again Later...!!!');
  }
}

module.exports = { allowLogUserIn, allowLogAdminIn };
