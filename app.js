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
require('./controllers/upvotes_controller')(app);
require('./controllers/comments_controller')(app);
app.use(express.static('public'));
var port = 3000;
if (process.argv[3]) {
    port = Number(process.argv[3]);
}
var server = app.listen(port, function () {
    console.log('Listening on %d', server.address().port);
});