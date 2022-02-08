const File = require('../../models/file');
const User = require('../../models/user');

async function userDashboardController(user, req, res, next) {
  try {
    const recentFiles = await File.find({})
      .sort('-createdAt')
      .limit(3)
      .select('uploaderInfo.email fileSize -_id')
      .lean()
      .exec();

    const recentUsers = await User.find({ role: { $ne: 'Admin' } })
      .sort('-createdAt')
      .limit(3)
      .select('username email.address -_id')
      .lean()
      .exec();

    const date = new Date(user.createdAt);
    return res.status(200).render('admin/dashboard', {
      username: user.username,
      email: user.email.address,
      role: user.role.toLowerCase(),
      totalLogins: user.totalLogins,
      createdAt: date.toDateString(),
      recentUsers,
      recentFiles,
    });
  } catch (error) {
    return res.status(500).json({
      username: user.username,
      role: user.role,
      ok: false,
      message: 'Something went wrong. Try Again Later.',
    });
  }
}

module.exports = userDashboardController;
