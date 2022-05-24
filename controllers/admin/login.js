const httpErrors = require('http-errors');
const { allowLogAdminIn } = require('../../helpers/logUserIn');
const { checkEmailAdmin } = require('../../helpers/findUserDetails');
const { loginValidation } = require('../../helpers/checkUserInput');

async function loginUser(req, res, next) {
  try {
    const AdminDetails = {
      email: req.body.email,
    };

    const isValidLoginDeatils = await loginValidation(AdminDetails, next);
    if (isValidLoginDeatils) {
      const admin = await checkEmailAdmin(isValidLoginDeatils.email, next);
      if (!admin) {
        return next(httpErrors.Unauthorized('Invalid Login Details.'));
      }

      const isValidPassword = await admin.checkPassword(req.body.password);
      if (!isValidPassword) {
        return next(httpErrors.Unauthorized('Invalid Login Details.'));
      }

      if (admin.role === 'Admin') {
        await allowLogAdminIn(admin._id, req, res);
        await admin.updateLoginsCount();
        return res.status(200).json({
          ok: true,
          message: 'Logged In. Redirecting To Admin Dashboard.',
          redirectUrl: `${process.env.ROOT_DOMAIN}/admin/dashboard`,
        });
      } else
        return res.status(403).json({
          ok: false,
          message: "You don't have the permission to access this route.",
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

module.exports = loginUser;
