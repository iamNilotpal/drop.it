const express = require('express');
const Router = express.Router();
const authorizeUser = require('../../middlewares/authorizeUser');

const { apiLimitter } = require('../../helpers/rateLimitter');

// -------------------- User Dashboard -------------------- //
Router.get(
  '/user/dashboard',
  authorizeUser,
  require('../../controllers/client/profile')
);

// ---------------------- Change Username And Email ----------------------
Router.post(
  '/user/change-info',
  require('../../middlewares/authorizeUser'),
  require('../../controllers/client/changeinfo')
);

// -------------------- Upload File -------------------- //
Router.post(
  '/api/file/upload',
  apiLimitter,
  authorizeUser,
  require('../../controllers/functions/upload')
);

// -------------------- Send Email -------------------- //
Router.post(
  '/api/file/send',
  apiLimitter,
  authorizeUser,
  require('../../controllers/functions/mail')
);

// -------------------- Clear History End Point -------------------- //
Router.delete(
  '/user/remove-history',
  authorizeUser,
  require('../../controllers/functions/history').removeHistory
);

// ---------------- Get Image Files ---------------- //
Router.get(
  '/user/history/get-images',
  authorizeUser,
  require('../../controllers/functions/history').getImages
);

// ---------------- Get Video Files ---------------- //
Router.get(
  '/user/history/get-videos',
  authorizeUser,
  require('../../controllers/functions/history').getVideos
);

// ---------------- Get Other Files ---------------- //
Router.get(
  '/user/history/get-others',
  authorizeUser,
  require('../../controllers/functions/history').getOthers
);

// ---------------- Remove Image File ---------------- //
Router.post(
  '/user/history/remove-image',
  authorizeUser,
  require('../../controllers/functions/history').removeImage
);

// ---------------- Remove Video File ---------------- //
Router.post(
  '/user/history/remove-video',
  authorizeUser,
  require('../../controllers/functions/history').removeVideo
);

// ---------------- Remove Other File ---------------- //
Router.post(
  '/user/history/remove-other',
  authorizeUser,
  require('../../controllers/functions/history').removeOther
);

// -------------------- Settings End Point -------------------- //
Router.get(
  '/user/settings',
  authorizeUser,
  require('../../controllers/functions/settings')
);

// ---------------------- Delete Account ---------------------- //
Router.delete(
  '/user/delete-account',
  require('../../middlewares/authorizeUser'),
  require('../../controllers/client/deleteAccount')
);

// -------------------- Download Page-------------------- //
Router.get(
  '/uploads/file/:uuid',
  require('../../controllers/functions/download').renderDownloadPage
);

// -------------------- Download End Point -------------------- //
Router.get(
  '/file/download/:uuid',
  require('../../controllers/functions/download').downloadFile
);

module.exports = Router;
