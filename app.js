const path = require('path');
const express = require('express');
const httpErrors = require('http-errors');
const cookieParser = require('cookie-parser');
const nodeScheduler = require('node-schedule');
const helmet = require('helmet');

const app = express();
app.disable('x-powered-by');

/* ------- Scheduler To Delete Files From DB (Runs Every 5 Hour) ------- */
nodeScheduler.scheduleJob(
  'deleteFilesFromDB',
  '0 */5 * * *',
  require('./services/deleteFilesScheduler')
);

// --------------- Middlewares --------------- //
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// --------------- Template Engine --------------- //
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --------------- Static Assets --------------- //
app.use(express.static(path.join(__dirname, 'public')));

// --------------- User Routes --------------- //
app.use('/auth', require('./routes/client/auth.route'));
app.use(require('./routes/client/dashboard.route'));

// --------------- Admin Routes --------------- //
app.use('/admin/auth', require('./routes/admin/auth.route'));
app.use(require('./routes/admin/dashboard.route'));

// --------------- 404 Error Handler --------------- //
app.use((req, res, next) => next(httpErrors.NotFound()));

// --------------- Global Error Handler --------------- //
app.use((error, req, res, next) => {
  if (error.status === 404) {
    return res.status(404).render('errors/404');
  } else {
    return res.status(error.status || 500).json({
      ok: false,
      status: error.status || 500,
      message: error.message || 'Something Went Wrong. Please Try Again Later.',
    });
  }
});

module.exports = app;
