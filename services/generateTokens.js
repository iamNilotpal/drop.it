const JWT = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const Session = require('../models/session');

// ----------------- Generate Session Token ----------------- //
async function generateSessionToken(userId, connectionInfo) {
  try {
    const sessionToken = randomBytes(50).toString('hex');
    await Session.create({
      userId,
      sessionToken,
      ip: connectionInfo.ip,
      userAgent: connectionInfo.userAgent,
    });
    return sessionToken;
  } catch (error) {
    throw new Error('Somehting Went Wrong. Please Try Again Later.');
  }
}

// ----------------- Generate Access And Refresh Token ----------------- //
async function generateAccessAndRefreshTokens(userId, connectionInfo) {
  try {
    const sessionToken = await generateSessionToken(userId, connectionInfo);
    const JWT_SIGNATURE = process.env.JWT_SIGNATURE;
    const accessToken = JWT.sign({ sessionToken, userId }, JWT_SIGNATURE);
    const refreshToken = JWT.sign({ sessionToken }, JWT_SIGNATURE);
    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error('Somehting Went Wrong. Please Try Again Later.');
  }
}

module.exports = generateAccessAndRefreshTokens;
