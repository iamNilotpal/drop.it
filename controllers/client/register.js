const httpErrors = require('http-errors');
const { registrationValidation } = require('../../helpers/checkUserInput');
const { checkEmail, checkUsername } = require('../../helpers/findUserDetails');
const hashPassword = require('../../helpers/hashPassword');
const User = require('../../models/user');

async function registerUser(req, res, next) {
  try {
    const userDetails = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    };

    if (userDetails.username !== userDetails.username.toLowerCase()) {
      return next(httpErrors.BadRequest(`Username must be in Lowercase.`));
    }

    if (userDetails.email !== userDetails.email.toLowerCase()) {
      return next(httpErrors.BadRequest(`Email must be in Lowercase.`));
    }

    if (userDetails.username.indexOf(' ') !== -1) {
      return next(
        httpErrors.BadRequest(
          `Username cann't contain empty spaces. Try another one.`
        )
      );
    }

    const isValidRegistrationDetails = await registrationValidation(
      userDetails,
      next
    );

    if (isValidRegistrationDetails) {
      // Check if username already exist or not
      const existUsername = await checkUsername(
        isValidRegistrationDetails.username
      );

      if (existUsername) {
        return next(
          httpErrors.Conflict(
            `Username "${isValidRegistrationDetails.username}" is already in use. Try another one.`
          )
        );
      }

      // Check if email already exist or not
      const existEmail = await checkEmail(isValidRegistrationDetails.email);
      if (existEmail) {
        return next(
          httpErrors.Conflict(
            `"${isValidRegistrationDetails.email}" is already registered.`
          )
        );
      }

      const hashedPassword = await hashPassword(
        isValidRegistrationDetails.password
      );

      const user = new User({
        'email.address': isValidRegistrationDetails.email,
        username: isValidRegistrationDetails.username,
        password: hashedPassword,
      });
      await user.save();
      return res.status(200).json({
        ok: true,
        message: 'Registered Successfully. Redirecting To Login Page.',
        redirectUrl: `https://${process.env.ROOT_DOMAIN}/auth/login`,
      });
    }
  } catch (error) {
    if (error.isJoi) {
      error.status = 422;
      return next(error);
    }

    return next(
      httpErrors.InternalServerError(
        error.message || 'Something Went Wrong. Please Try Again Later...!!!'
      )
    );
  }
}

module.exports = registerUser;
