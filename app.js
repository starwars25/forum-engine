require('./environment')();
var express = require('express');
var util = require('util');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
app.use(cookieParser());
var model = require('./model');
var async = require('async');
app.use(function (req, res, next) {
    console.log(req.path);
    next();
});
app.get('/', function (req, res) {
    res.sendFile(util.format('%s/public/layout.html', __dirname));
});

require('./controllers/authentication_controller')(app);
require('./controllers/users_controller')(app);
require('./controllers/topics_controller')(app);
require('./controllers/opinions_controller')(app);
app.use(express.static('public'));
var server = app.listen(3000, function () {
    console.log('Listening on %d', server.address().port);
});