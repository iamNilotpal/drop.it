const path = require('path');
const express = require('express');
const Router = express.Router();

const { loginLimitter } = require('../../helpers/rateLimitter');
const {
  isAdminLoggedIn,
  isUserLoggedIn,
} = require('../../middlewares/isLoggedIn');

/* ----------------------------------- Routes ----------------------------------- */

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

Router.delete(
  '/logout',
  require('../../middlewares/authorizeAdmin'),
  require('../../controllers/admin/logout').logOutAdmin
);

Router.delete(
  '/logout-all',
  require('../../middlewares/authorizeAdmin'),
  require('../../controllers/admin/logout').logoutFromAll
);

module.exports = Router;
