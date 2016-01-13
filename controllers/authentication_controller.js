module.exports = function(app) {
    var util = require('util');
    var vkauth = require('vkauth');
    var bcrypt = require('bcrypt');
    vkauth.config.client_id = Number(process.env.VK_CLIENT_ID);
    vkauth.config.app_secret = process.env.VK_APP_SECRET;
    vkauth.config.host = 'localhost:3000';
    vkauth.config.route = '/token';
    var VK = require('vksdk');
    var vk = new VK({
        'appId': process.env.VK_CLIENT_ID,
        'appSecret': process.env.VK_APP_SECRET,
        'language': 'ru'
    });
    var model = require('../model');
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
                    model.User.findOne({
                        where: {
                            vk_user_id: user.vk_user_id
                        }
                    }).then(function(instance) {
                        if (instance) {
                            console.log("User with id %d found.", user.vk_user_id);
                            bcrypt.genSalt(10, function(err, salt) {
                                bcrypt.hash(token.access_token, salt, function(err, hash) {
                                    if (err) {
                                        sendError(res);
                                    } else {
                                        var params = {name: name, token_digest: hash};
                                        if(!instance.own_avatar) {
                                            params.avatar_url = user.avatar_url
                                        }
                                        instance.update(params).then(function(instance) {
                                            sendAuthCredentials(res, token);
                                        }).catch(function(error) {
                                            console.log(error);
                                            sendError(res);
                                        });
                                    }
                                });
                            });


                        } else {
                            console.log("User with id %d not found.", user.vk_user_id);
                            bcrypt.genSalt(10, function(err, salt) {
                                bcrypt.hash(token.access_token, salt, function(err, hash) {
                                    if (err) {
                                        sendError(res);
                                    } else {
                                        user.token_digest = hash;
                                        model.User.create(user).then(function(instance) {
                                            console.log("User with id %d created.", user.vk_user_id);
                                            sendAuthCredentials(res, token);
                                        }).catch(function(error) {
                                            console.log(error);
                                            sendError(res);
                                        });
                                    }
                                });
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
    app.get('/vk-url', function (req, res) {
        res.json({url: vkauth.getUrl()});
    });

};