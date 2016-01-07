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
var currentUser = require('./authorize')(app);
var notLoggedIn = function(req, res, next) {
    if (req.currentUser) {
        next();
    } else {
        console.log('Not logged in');
        res.sendStatus(401);
    }
};
app.get('/', function (req, res) {
    res.sendFile(util.format('%s/public/layout.html', __dirname));
});
app.get('/current-user', currentUser, notLoggedIn, function(req, res) {
    res.json({
        name: req.currentUser.name,
        nickname: req.currentUser.nickname,
        avatar_url: req.currentUser.avatar_url
    });
});
app.use(express.static('public'));
var server = app.listen(3000, function () {
    console.log('Listening on %d', server.address().port);
});