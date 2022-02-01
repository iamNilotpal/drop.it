const JOI = require('joi');

const registrationValidationSchema = JOI.object({
  email: JOI.string().email().trim().lowercase().required(),
  username: JOI.string().min(3).max(10).trim().lowercase().required(),
  password: JOI.string().min(5).max(20).trim().required(),
});

const emailVerificationSchema = JOI.object({
  email: JOI.string().email().trim().lowercase().required(),
});

const usernameVerificationSchema = JOI.object({
  username: JOI.string().min(3).max(10).trim().lowercase().required(),
});

const PasswordVerificationSchema = JOI.object({
  newPassword: JOI.string().min(5).trim().max(20).required(),
});

module.exports = {
  registrationValidationSchema,
  emailVerificationSchema,
  usernameVerificationSchema,
  PasswordVerificationSchema,
};
