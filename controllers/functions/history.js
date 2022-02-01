const httpErrors = require('http-errors');
const File = require('../../models/file');
const fs = require('fs');
const path = require('path');
const fileExtensions = require('../../helpers/getExtensions');

async function getImages(user, req, res, next) {
  try {
    const files = await File.find({
      'uploaderInfo.id': user._id,
      extension: {
        $in: fileExtensions.IMAGES_EXT,
      },
    })
      .sort('-createdAt')
      .select('fileSize path receiverInfo createdAt uuid -_id')
      .lean()
      .exec();

    return res.status(200).json({ ok: true, files, username: user.username });
  } catch (error) {
    return next(httpErrors.InternalServerError('Something went wrong.'));
  }
}

async function getVideos(user, req, res, next) {
  try {
    const files = await File.find({
      'uploaderInfo.id': user._id,
      extension: {
        $in: fileExtensions.VIDEOS_EXT,
      },
    })
      .sort('-createdAt')
      .select('fileSize path receiverInfo createdAt uuid -_id')
      .lean()
      .exec();

    return res.status(200).json({ ok: true, files, username: user.username });
  } catch (error) {
    return next(httpErrors.InternalServerError('Something went wrong.'));
  }
}

async function getOthers(user, req, res, next) {
  try {
    const files = await File.find({
      'uploaderInfo.id': user._id,
      extension: {
        $nin: fileExtensions.OTHERS_EXT,
      },
    })
      .sort('-createdAt')
      .select('fileSize path receiverInfo createdAt uuid -_id')
      .lean()
      .exec();

    return res.status(200).json({ ok: true, files, username: user.username });
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
async function removeVideo(user, req, res, next) {
  try {
    await removeFile(user, req, res, next);
    return await getVideos(user, req, res, next);
  } catch (error) {
    return next(httpErrors.InternalServerError('Something went wrong.'));
  }
}
async function removeOther(user, req, res, next) {
  try {
    await removeFile(user, req, res, next);
    return await getOthers(user, req, res, next);
  } catch (error) {
    return next(httpErrors.InternalServerError('Something went wrong.'));
  }
}

async function removeHistory(user, req, res, next) {
  try {
    const filesToDelete = await File.find({
      'uploaderInfo.id': user._id,
    })
      .select('path fileSize -_id')
      .lean()
      .exec();

    if (filesToDelete?.length === 0)
      return res.status(200).json({ ok: true, message: 'No History Found.' });

    await File.deleteMany({ 'uploaderInfo.id': user._id }).exec();
    let fileSize = 0;
    filesToDelete.forEach(async (file) => {
      try {
        if (fs.existsSync(path.join(__dirname, '../../', file.path)))
          fs.unlinkSync(path.join(__dirname, '../../', file.path));
        fileSize += file.fileSize;
      } catch (error) {
        console.log(error);
        return next(httpErrors.InternalServerError('Error deleting files.'));
      }
    });

    await user.decreaseFilesCountAndStorage(fileSize, filesToDelete.length);
    return res.status(200).json({
      ok: true,
      message: `${filesToDelete.length} File(s) Were Removed.`,
    });
  } catch (error) {
    console.log(error);
    return next(httpErrors.InternalServerError('Something went wrong.'));
  }
}

async function removeFile(user, req, res, next) {
  try {
    const { uuid } = req.body;
    if (!uuid) return next(httpErrors.BadRequest("File Doesn't Exist."));

    const file = await File.findOne({ uuid }).exec();
    if (!file) return next(httpErrors.BadRequest("File Doesn't Exist."));

    if (fs.existsSync(path.join(__dirname, '../../', file.path)))
      fs.unlinkSync(path.join(__dirname, '../../', file.path));

    await user.decreaseFilesCountAndStorage(file.fileSize);
    await file.remove();
  } catch (error) {
    console.log(error);
    throw httpErrors.InternalServerError('Something went wrong.');
  }
}

module.exports = {
  removeHistory,
  getImages,
  getVideos,
  getOthers,
  removeImage,
  removeVideo,
  removeOther,
};
