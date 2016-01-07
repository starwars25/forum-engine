require('./environment')();
var express = require('express');
var util = require('util');
var vkauth = require('vkauth');
vkauth.config.client_id = Number(process.env.VK_CLIENT_ID);
vkauth.config.app_secret = process.env.VK_APP_SECRET;
vkauth.config.host = 'localhost:3000';
vkauth.config.route = '/token';
var app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var VK = require('vksdk');
var vk = new VK({
    'appId': process.env.VK_CLIENT_ID,
    'appSecret': process.env.VK_APP_SECRET,
    'language': 'ru'
});
var model = require('./model');
app.use(function (req, res, next) {
    console.log(req.path);
    next();
});
var sendAuthCredentials = function(res, token) {
    var expires = new Date();
    expires.setSeconds(expires.getSeconds() + token.expires_in);
    res.cookie('token', token.access_token, {expires: expires});
    res.cookie('user-id', token.user_id, {expires: expires});
    res.redirect('/');
};
var sendError = function(res) {
    res.sendStatus(400);
};
vkauth.start(app, function (res, err, token) {
    if (err) {
        console.log(err);
        res.sendStatus(500);
    } else {

        vk.setToken(token);
        vk.request('users.get', {user_ids: token.user_id, fields: ['photo_max']}, function(response) {
            if (response.error) {
                res.redirect('/#/not-found');
            } else {
                var name = [response.response[0].first_name, response.response[0].last_name].join(' ')
                var user = {
                    vk_user_id: response.response[0].id,
                    name: name,
                    avatar_url: response.response[0].photo_max,
                    nickname: name,
                    banned: false,
                    admin: false
                };
                console.log(user);
                model.User.findOne({
                    where: {
                        vk_user_id: user.vk_user_id
                    }
                }).then(function(instance) {
                    if (instance) {
                        console.log("User with id %d found.", user.vk_user_id);
                        instance.update({name: name, avatar_url: user.avatar_url}).then(function(instance) {
                            sendAuthCredentials(res, token);
                        }).catch(function(error) {
                            console.log(error);
                            sendError(res);
                        });
                    } else {
                        console.log("User with id %d not found.", user.vk_user_id);
                        model.User.create(user).then(function(instance) {
                            console.log("User with id %d created.", user.vk_user_id);
                            sendAuthCredentials(res, token);
                        }).catch(function(error) {
                            console.log(error);
                            sendError(res);
                        });
                    }
                }).catch(function(error) {
                    console.log(error);
                    sendError(res);

                });

            }
        });

    }
});
app.get('/', function (req, res) {
    res.sendFile(util.format('%s/public/layout.html', __dirname));
});
app.get('/vk-url', function (req, res) {
    res.json({url: vkauth.getUrl()});
});
app.use(express.static('public'));
var server = app.listen(3000, function () {
    console.log('Listening on %d', server.address().port);
});