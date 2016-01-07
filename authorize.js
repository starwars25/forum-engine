module.exports = function (app) {
    var noUser = function(next) {
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
                            noUser(next);
                        } else {
                            if (res) {
                                req.currentUser = instance;
                                next();
                            } else {
                                noUser(next);
                            }
                        }
                    });
                } else {
                    noUser(next);
                }
            }).catch(function (err) {
                noUser(next);
            });
        } else {
            noUser(next);
        }
    };
    return currentUser;
};