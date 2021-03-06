const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema(
  {
    email: {
      address: { type: String, unique: true, lowercase: true, required: true },
      verified: { type: Boolean, default: true, required: true },
    },
    username: {
      type: String,
      unique: true,
      minlength: 3,
      maxlength: 10,
      lowercase: true,
      required: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: 'Admin',
      default: 'Admin',
      required: true,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
      required: true,
    },
    totalLogins: { type: Number, default: 0, required: false },
  },
  { timestamps: true }
);

AdminSchema.methods.checkPassword = async function (password) {
  try {
    return bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error('Something Went Wrong. Please Try Again Later.');
  }
};

AdminSchema.methods.updateLoginsCount = async function () {
  try {
    this.totalLogins++;
    return this.save();
  } catch (error) {
    throw new Error('Something Went Wrong. Please Try Again Later.');
  }
};

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;
