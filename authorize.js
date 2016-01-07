module.exports = function (app) {
    var noUser = function(req, next) {
        req.currentUser = null;
        next();
    };
    var model = require('./model');
    var bcrypt = require('bcrypt');
    var currentUser = function (req, res, next) {
        if (req.cookies['user-id'] && req.cookies['token']) {
            model.User.findOne({where: {vk_user_id: Number(req.cookies['user-id'])}}).then(function (instance) {
                if (instance) {
                    bcrypt.compare(req.cookies['token'], instance.token_digest, function (err, res) {
                        if (err) {
                            noUser(req, next);
                        } else {
                            if (res) {
                                req.currentUser = instance;
                                next();
                            } else {
                                noUser(req, next);
                            }
                        }
                    });
                } else {
                    noUser(req, next);
                }
            }).catch(function (err) {
                noUser(req, next);
            });
        } else {
            noUser(req, next);
        }
    };
    return currentUser;
};