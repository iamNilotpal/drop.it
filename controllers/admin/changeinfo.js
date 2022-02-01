const httpErrors = require('http-errors');
const {
  usernameVerificationSchema,
  emailVerificationSchema,
} = require('../../services/userInputValidation');
const { checkEmail, checkUsername } = require('../../helpers/findUserDetails');

async function changeUserInformation(user, req, res, next) {
  try {
    const { username, email } = req.body;

    if (!username && !email) {
      return next(httpErrors.BadRequest('Atleast one field is required.'));
    }

    if (username || email) {
      if (user.email.address === email)
        return next(
          httpErrors.BadRequest(
            'Email must be different from your current email.'
          )
        );

      if (await checkEmail(email))
        return next(httpErrors.BadRequest('Email is already registered.'));

      if (await checkUsername(username))
        return next(httpErrors.BadRequest('Username is already in use.'));

      if (user.username === username)
        return next(
          httpErrors.BadRequest(
            'Username must be different from your current username.'
          )
        );
    }

    let validUsername, validEmail;
    if (username)
      validUsername = await usernameVerificationSchema.validateAsync({
        username,
      });

    if (email)
      validEmail = await emailVerificationSchema.validateAsync({ email });

    if (validUsername || validEmail) {
      await user.changeInformation({
        username: validUsername?.username || user.username,
        email: validEmail?.email || user.email.address,
      });

      return res.status(200).json({
        ok: true,
        message: 'Information Updated.',
        username: user.username,
        email: user.email.address,
      });
    }
  } catch (error) {
    if (error.isJoi) {
      error.status = 422;
      return next(error);
    }

    return next(
      httpErrors.InternalServerError(
        error.message || 'Something Went Wrong. Please Try Again Later.'
      )
    );
  }
}

module.exports = changeUserInformation;
