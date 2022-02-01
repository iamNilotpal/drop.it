const httpErrors = require('http-errors');
const { allowLogUserIn } = require('../../helpers/logUserIn');
const { checkEmail } = require('../../helpers/findUserDetails');
const { loginValidation } = require('../../helpers/checkUserInput');

async function loginUser(req, res, next) {
  try {
    const isValidLoginDeatils = await loginValidation(
      { email: req.body.email },
      next
    );

    if (isValidLoginDeatils) {
      const user = await checkEmail(isValidLoginDeatils.email, next);
      if (!user) {
        return next(httpErrors.Unauthorized('Invalid Login Details.'));
      }

      const isValidPassword = await user.checkPassword(req.body.password);
      if (!isValidPassword) {
        return next(httpErrors.Unauthorized('Invalid Login Details.'));
      }

      if (user.role === 'User') {
        await user.updateLoginsCount();
        await allowLogUserIn(user._id, req, res);
        return res.status(200).json({
          ok: true,
          message: 'Logged In. Redirecting To Your Dashboard.',
          redirectUrl: `https://${process.env.ROOT_DOMAIN}/user/dashboard`,
        });
      } else
        return res.status(403).json({
          ok: false,
          message: "You don't have the permission to access this route.",
        });
    }
  } catch (error) {
    console.log(error);
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

module.exports = loginUser;
