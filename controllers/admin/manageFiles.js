const httpErrors = require('http-errors');
const File = require('../../models/file');
const fs = require('fs');
const path = require('path');
const User = require('../../models/user');
const fileExtensions = require('../../helpers/getExtensions');

async function getImages(user, req, res, next) {
  try {
    const files = await File.find({
      'uploaderInfo.id': { $ne: user._id },
      extension: {
        $in: fileExtensions.IMAGES_EXT,
      },
    })
      .sort('-createdAt')
      .select('fileSize uuid uploaderInfo.email receiverInfo createdAt -_id')
      .lean()
      .exec();

    return res.status(200).json({ ok: true, files });
  } catch (error) {
    return next(httpErrors.InternalServerError('Something went wrong.'));
  }
}

async function getVideos(user, req, res, next) {
  try {
    const files = await File.find({
      'uploaderInfo.id': { $ne: user._id },
      extension: {
        $in: fileExtensions.VIDEOS_EXT,
      },
    })
      .sort('-createdAt')
      .select('fileSize uuid uploaderInfo.email receiverInfo createdAt -_id')
      .lean()
      .exec();

    return res.status(200).json({ ok: true, files });
  } catch (error) {
    return next(httpErrors.InternalServerError('Something went wrong.'));
  }
}

async function getOthers(user, req, res, next) {
  try {
    const files = await File.find({
      'uploaderInfo.id': { $ne: user._id },
      extension: {
        $nin: fileExtensions.OTHERS_EXT,
      },
    })
      .sort('-createdAt')
      .select('fileSize uuid uploaderInfo.email receiverInfo createdAt -_id')
      .lean()
      .exec();

    return res.status(200).json({ ok: true, files });
  } catch (error) {
    return next(httpErrors.InternalServerError('Something went wrong.'));
  }
}

async function removeImage(user, req, res, next) {
  try {
    await removeFile(user, req, res, next);
    return await getImages(user, req, res, next);
  } catch (error) {
    return next(httpErrors.InternalServerError('Something went wrong.'));
  }
}
async function removeVideos(user, req, res, next) {
  try {
    await removeFile(user, req, res, next);
    return await getVideos(user, req, res, next);
  } catch (error) {
    return next(httpErrors.InternalServerError('Something went wrong.'));
  }
}
async function removeOthers(user, req, res, next) {
  try {
    await removeFile(user, req, res, next);
    return await getOthers(user, req, res, next);
  } catch (error) {
    return next(httpErrors.InternalServerError('Something went wrong.'));
  }
}

async function removeFile(user, req, res, next) {
  try {
    const { uuid } = req.body;
    if (!uuid) return next(httpErrors.BadRequest("File Doesn't Exist."));

    const file = await File.findOne({ uuid }).exec();
    if (!file) return next(httpErrors.BadRequest("File Doesn't Exist."));

    const deletedFileUser = await User.findOne({
      'email.address': file.uploaderInfo.email,
    });

    if (!deletedFileUser)
      return next(httpErrors.BadRequest('Error deleting file.'));

    if (fs.existsSync(path.join(__dirname, '../../', file.path)))
      fs.unlinkSync(path.join(__dirname, '../../', file.path));

    await deletedFileUser.decreaseFilesCountAndStorage(file.fileSize);
    await file.remove();
  } catch (error) {
    console.log(error);
    throw httpErrors.InternalServerError('Something went wrong.');
  }
}

module.exports = {
  getImages,
  getVideos,
  getOthers,
  removeImage,
  removeVideos,
  removeOthers,
};
