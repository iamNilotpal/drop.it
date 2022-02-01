const path = require('path');
const express = require('express');
const Router = express.Router();
const authorizeAdmin = require('../../middlewares/authorizeAdmin');

// ---------------- Admin Dashboard ---------------- //
Router.get(
  '/admin/dashboard',
  authorizeAdmin,
  require('../../controllers/admin/profile')
);

// ---------------- Admin Dashboard ---------------- //
Router.delete(
  '/admin/delete-account',
  authorizeAdmin,
  require('../../controllers/admin/deleteAccount')
);

// ---------------- Get All Users---------------- //
Router.get(
  '/admin/get-users',
  authorizeAdmin,
  require('../../controllers/admin/manageUsers').getAllUsers
);

// ---------------- Delete User ---------------- //
Router.post(
  '/admin/remove-user',
  authorizeAdmin,
  require('../../controllers/admin/manageUsers').deleteUserAccount
);

// ---------------- Get All Admins---------------- //
Router.get(
  '/admin/get-admins',
  authorizeAdmin,
  require('../../controllers/admin/manageAdmins').getAllAdmins
);

// ---------------- Delete Admin Account ---------------- //
Router.post(
  '/admin/remove-admin',
  authorizeAdmin,
  require('../../controllers/admin/manageAdmins').deleteAdminAccount
);

// ---------------- Add Admin Account ---------------- //
Router.post(
  '/admin/add-admin',
  authorizeAdmin,
  require('../../controllers/admin/manageAdmins').addAdminUser
);

// ------------------ Admin Change Password ------------------ //
Router.post(
  '/admin/change-password',
  require('../../middlewares/authorizeAdmin'),
  require('../../controllers/admin/changePassword')
);

// ---------------------- Change Username And Email ----------------------
Router.post(
  '/admin/change-info',
  require('../../middlewares/authorizeAdmin'),
  require('../../controllers/admin/changeinfo')
);

// ---------------- Get Image Files ---------------- //
Router.get(
  '/admin/get-images',
  authorizeAdmin,
  require('../../controllers/admin/manageFiles').getImages
);

// ---------------- Get Video Files ---------------- //
Router.get(
  '/admin/get-videos',
  authorizeAdmin,
  require('../../controllers/admin/manageFiles').getVideos
);

// ---------------- Get Other Files ---------------- //
Router.get(
  '/admin/get-others',
  authorizeAdmin,
  require('../../controllers/admin/manageFiles').getOthers
);

// ---------------- Remove Image File ---------------- //
Router.post(
  '/admin/remove-image',
  authorizeAdmin,
  require('../../controllers/admin/manageFiles').removeImage
);

// ---------------- Remove Video File ---------------- //
Router.post(
  '/admin/remove-video',
  authorizeAdmin,
  require('../../controllers/admin/manageFiles').removeVideos
);

// ---------------- Remove Other File ---------------- //
Router.post(
  '/admin/remove-other',
  authorizeAdmin,
  require('../../controllers/admin/manageFiles').removeOthers
);

// -------------------- Settings End Point -------------------- //
Router.get(
  '/admin/settings',
  authorizeAdmin,
  require('../../controllers/functions/settings')
);

module.exports = Router;
