const { formatBytes } = require('../../helpers/formatFile');

async function userDashboardController(user, req, res, next) {
  try {
    const date = new Date(user.createdAt);
    return res.status(200).render('client/dashboard', {
      username: user.username,
      email: user.email.address,
      role: user.role.toLowerCase(),
      ip: req.ip,
      totalLogins: user.totalLogins,
      activeFiles: user.activeFiles,
      activeStorage: formatBytes(user.activeStorage),
      totalEmailsSent: user.totalEmailsSent,
      createdAt: date.toDateString(),
    });
  } catch (error) {
    return res.status(500).render('client/dashboard', {
      error:
        'Something went wrong on our end. We apologize for the inconvenience 😢.',
      status: 'Internal Server Error.',
      username: user.username,
      role: user.role,
    });
  }
}

module.exports = userDashboardController;
