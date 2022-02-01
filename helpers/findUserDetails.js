const User = require('../models/user');
const Admin = require('../models/admin');

// **************** Check Email **************** //
async function checkEmail(email) {
  try {
    return await User.findOne({ 'email.address': email }).exec();
  } catch (error) {
    throw new Error('Something Went Wrong. Please Try Again Later.');
  }
}

// **************** Check Username **************** //
async function checkUsername(username) {
  try {
    return await User.findOne({ username }).exec();
  } catch (error) {
    throw new Error('Something Went Wrong. Please Try Again Later.');
  }
}

// **************** Check Email Admin**************** //
async function checkEmailAdmin(email) {
  try {
    return await Admin.findOne({ 'email.address': email }).exec();
  } catch (error) {
    throw new Error('Something Went Wrong. Please Try Again Later.');
  }
}

// **************** Check Username **************** //
async function checkUsernameAdmin(username) {
  try {
    return await Admin.findOne({ username }).exec();
  } catch (error) {
    throw new Error('Something Went Wrong. Please Try Again Later.');
  }
}

module.exports = {
  checkEmail,
  checkUsername,
  checkEmailAdmin,
  checkUsernameAdmin,
};
