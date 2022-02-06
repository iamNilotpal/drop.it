const httpErrors = require('http-errors');
const {
  clearUserAccessAndRefreshTokens,
} = require('../../helpers/clearCookies');
const Session = require('../../models/session');
const File = require('../../models/file');
const fs = require('fs');
const path = require('path');

async function deleteUserAccount(user, req, res, next) {
  try {
    await Session.deleteMany({ userId: user._id });
    await clearUserAccessAndRefreshTokens(res);

    const filesToDelete = await File.find({
      'uploaderInfo.id': user._id,
    })
      .select('path')
      .exec();

    filesToDelete.forEach(async (file) => {
      try {
        if (fs.existsSync(path.join(__dirname, '../../', file.path)))
          fs.unlinkSync(path.join(__dirname, '../../', file.path));
        await file.remove();
      } catch (error) {
        console.error(error);
        return next(httpErrors.InternalServerError('Something went wrong.'));
      }
    });

    await user.remove();
    return res.status(200).json({
      ok: true,
      message: `Account Deleted. Thank you for using our service.`,
      redirectUrl: `${process.env.ROOT_DOMAIN}`,
    });
  } catch (error) {
    console.log(error);
    return next(
      httpErrors.InternalServerError(
        error.message || 'Something Went Wrong. Please Try Again Later.'
      )
    );
  }
}

module.exports = deleteUserAccount;
