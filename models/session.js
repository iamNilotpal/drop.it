const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionToken: { type: String, required: true, unique: true },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
  },
  { timestamps: true }
);

const Session = mongoose.model('Session', SessionSchema);
module.exports = Session;
