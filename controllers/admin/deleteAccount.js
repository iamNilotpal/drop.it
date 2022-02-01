const httpErrors = require('http-errors');
const {
  clearUserAccessAndRefreshTokens,
} = require('../../helpers/clearCookies');
const Session = require('../../models/session');
const File = require('../../models/file');
const Admin = require('../../models/admin');
const fs = require('fs');
const path = require('path');

async function deleteUserAccount(user, req, res, next) {
  try {
    const adminCount = await Admin.find({}).count().exec();
    if (adminCount < 2) {
      return res.status(400).json({
        ok: false,
        message:
          "You cann't delete your account since you are the only Admin left.",
      });
    }

    await Session.deleteMany({ userId: user._id });
    await clearUserAccessAndRefreshTokens(res);

    await user.remove();
    return res.status(200).json({
      ok: true,
      message: 'Account Deleted. Thank you for using our service.',
      redirectUrl: `https://${process.env.ROOT_DOMAIN}`,
    });
  } catch (error) {
    return next(
      httpErrors.InternalServerError(
        error.message || 'Something Went Wrong. Please Try Again Later.'
      )
    );
  }
}

module.exports = deleteUserAccount;
