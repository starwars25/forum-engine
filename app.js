require('./environment')();
var express = require('express');
var util = require('util');
var vkauth = require('vkauth');
vkauth.config.client_id = Number(process.env.VK_CLIENT_ID);
vkauth.config.app_secret = process.env.VK_APP_SECRET;
vkauth.config.host = 'localhost:3000';
vkauth.config.route = '/token';
var app = express();

app.use(function(req, res, next) {
    console.log(req.path);
    next();
});

vkauth.start(app, function(res, err, token) {
    if (err) {
        console.log(err);
        res.sendStatus(500);
    } else {
        var expires = new Date();
        expires.setSeconds(expires.getSeconds() + token.expires_in);
        res.cookie('token', token.access_token, {expires: expires});
        res.cookie('user-id', token.user_id, {expires: expires});
        res.redirect('/');
    }
});

app.get('/', function(req, res) {
    res.sendFile(util.format('%s/public/layout.html', __dirname));
});

app.get('/vk-url', function(req, res) {
    res.json({url: vkauth.getUrl()});
});

app.use(express.static('public'));


var server = app.listen(3000, function() {
    console.log('Listening on %d', server.address().port);
});