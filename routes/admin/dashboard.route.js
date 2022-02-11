const express = require('express');
const Router = express.Router();
const authorizeAdmin = require('../../middlewares/authorizeAdmin');

/* ----------------------------------- Routes --------------------------------------- */

Router.get(
  '/admin/dashboard',
  authorizeAdmin,
  require('../../controllers/admin/profile')
);

Router.post(
  '/admin/change-password',
  authorizeAdmin,
  require('../../controllers/admin/changePassword')
);

Router.post(
  '/admin/change-info',
  authorizeAdmin,
  require('../../controllers/admin/changeinfo')
);

Router.delete(
  '/admin/delete-account',
  authorizeAdmin,
  require('../../controllers/admin/deleteAccount')
);

Router.get(
  '/admin/settings',
  authorizeAdmin,
  require('../../controllers/client/settings')
);

Router.get(
  '/admin/get-users',
  authorizeAdmin,
  require('../../controllers/admin/manageUsers').getAllUsers
);

Router.post(
  '/admin/remove-user',
  authorizeAdmin,
  require('../../controllers/admin/manageUsers').deleteUserAccount
);

Router.get(
  '/admin/get-admins',
  authorizeAdmin,
  require('../../controllers/admin/manageAdmins').getAllAdmins
);

Router.post(
  '/admin/remove-admin',
  authorizeAdmin,
  require('../../controllers/admin/manageAdmins').deleteAdminAccount
);

Router.post(
  '/admin/add-admin',
  authorizeAdmin,
  require('../../controllers/admin/manageAdmins').addAdminUser
);

Router.get(
  '/admin/get-images',
  authorizeAdmin,
  require('../../controllers/admin/manageFiles').getImages
);

Router.get(
  '/admin/get-videos',
  authorizeAdmin,
  require('../../controllers/admin/manageFiles').getVideos
);

Router.get(
  '/admin/get-documents',
  authorizeAdmin,
  require('../../controllers/admin/manageFiles').getDocuments
);

Router.post(
  '/admin/remove-image',
  authorizeAdmin,
  require('../../controllers/admin/manageFiles').removeImage
);

Router.post(
  '/admin/remove-video',
  authorizeAdmin,
  require('../../controllers/admin/manageFiles').removeVideos
);

Router.post(
  '/admin/remove-document',
  authorizeAdmin,
  require('../../controllers/admin/manageFiles').removeDocument
);

module.exports = Router;
