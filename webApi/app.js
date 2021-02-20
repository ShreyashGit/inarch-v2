let createError = require('http-errors');
let express = require('express');
let fileUpload = require('express-fileupload');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let cors = require('cors');
let mongoose = require('./mongoose');
let compression = require('compression');
const common = require('./common');
const helmet = require('helmet');

let indexRouter = require('./routes/index');


let app = express();
app.use(compression());
app.use(helmet());
let db = mongoose();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json({limit: '25mb'}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload());

// var rootCas = require('ssl-root-cas/latest').create();
// rootCas.addFile(path.join(__dirname, './public/gd_bundle-g2-g1.crt'));
// require('https').globalAgent.options.ca = rootCas;

app.use(cors());

app.use('/', indexRouter);

require('./routes/products.server.routes')(app);
require('./routes/bookings.server.routes')(app);
require('./routes/financiers.server.routes')(app);
require('./routes/schemes.server.routes')(app);
require('./routes/user.server.routes')(app);
require('./routes/lookup.server.routes')(app);
require('./routes/productModels.server.routes')(app);
require('./routes/fileUploader.server.routes')(app);
require('./routes/receipt.server.routes')(app);
require('./routes/settlement.server.routes')(app);
require('./routes/payment.server.routes')(app);
require('./routes/division.server.routes')(app);
require('./routes/userMapping.server.routes')(app);
require('./routes/customerImport.server.routes')(app);
require('./routes/hdfc.server.routes')(app);
require('./routes/paymentSetting.server.routes')(app);
require('./routes/reports.server.routes')(app);
require('./businessLogic/cronJobBl');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  common.logger.error(err);
  // render the error page
  res.status(err.status || 500);
  res.send({message: err.message, stack: err.stack});
});
app.disable('etag');
app.disable('x-powered-by');
app.disable('server');
module.exports = app;
