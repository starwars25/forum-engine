require('./environment')();
var express = require('express');
var util = require('util');
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var model = require('./model');
app.use(function (req, res, next) {
    console.log(req.path);
    next();
});
require('./authenticate')(app);

app.get('/', function (req, res) {
    res.sendFile(util.format('%s/public/layout.html', __dirname));
});
app.use(express.static('public'));
var server = app.listen(3000, function () {
    console.log('Listening on %d', server.address().port);
});