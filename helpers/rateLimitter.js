const rateLimit = require('express-rate-limit');

const handler = (req, res) =>
  res.status(429).json({
    ok: false,
    message: 'Too many requests from this IP Address. Try again later.',
  });

const registrationLimitter = rateLimit({
  windowMs: 15 * 60 * 1000, //* 15 minutes //
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

const loginLimitter = rateLimit({
  windowMs: 20 * 60 * 1000, //* 20 minutes //
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

const apiLimitter = rateLimit({
  windowMs: 1 * 30 * 60 * 1000, //* 30 minutes //
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

module.exports = {
  registrationLimitter,
  loginLimitter,
  apiLimitter,
};
