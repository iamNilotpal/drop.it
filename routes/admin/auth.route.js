const path = require('path');
const express = require('express');
const Router = express.Router();

const {
  isAdminLoggedIn,
  isUserLoggedIn,
} = require('../../middlewares/isLoggedIn');
const { loginLimitter } = require('../../helpers/rateLimitter');

// ------------------ Admin Login ------------------ //
Router.get('/login', isAdminLoggedIn, isUserLoggedIn, (req, res, next) =>
  res.sendFile(path.join(__dirname, '../../public/src/pages/adminLogin.html'))
);

Router.post(
  '/login',
  loginLimitter,
  isUserLoggedIn,
  isAdminLoggedIn,
  require('../../controllers/admin/login')
);

// ------------------ Admin Logout ------------------ //
Router.delete(
  '/logout',
  require('../../middlewares/authorizeAdmin'),
  require('../../controllers/admin/logout')
);

module.exports = Router;
