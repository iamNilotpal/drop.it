const path = require('path');
const express = require('express');
const Router = express.Router();

const {
  isUserLoggedIn,
  isAdminLoggedIn,
} = require('../../middlewares/isLoggedIn');

const {
  registrationLimitter,
  loginLimitter,
} = require('../../helpers/rateLimitter');

// ---------------------- User Registration ---------------------- //
Router.get('/register', isUserLoggedIn, isAdminLoggedIn, (req, res) =>
  res.sendFile(path.join(__dirname, '../../public/src/pages/registration.html'))
);
Router.post(
  '/register',
  registrationLimitter,
  require('../../controllers/client/register')
);

// ---------------------- User Login ---------------------- //
Router.get('/login', isUserLoggedIn, isAdminLoggedIn, (req, res) =>
  res.sendFile(path.join(__dirname, '../../public/src/pages/login.html'))
);
Router.post('/login', loginLimitter, require('../../controllers/client/login'));

// ---------------------- User Logout ---------------------- //
Router.delete(
  '/logout',
  require('../../middlewares/authorizeUser'),
  require('../../controllers/client/logout')
);

// ---------------------- User Change Password ---------------------- //
Router.post(
  '/change-password',
  require('../../middlewares/authorizeUser'),
  require('../../controllers/client/changePassword')
);

module.exports = Router;
