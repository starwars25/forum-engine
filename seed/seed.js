// Should be called only from tests!

var model = require('../model');
var bcrypt = require('bcrypt');
var async = require('async');
var instances = {
    users: [],
    topics: [],
    opinions: []
};
module.exports = function(token, callback) {
    var token_digest = null;
    async.series([
        function(callback) {
            // Truncate all tables
            var models = [model.User, model.Topic, model.Opinion, model.Comment, model.Upvote];
            async.eachSeries(models, function(item, callback) {
                item.truncate().then(function() {
                    callback();
                }).catch(function(error) {
                    callback(error);
                });
            }, function(err) {
                if (err) {
                    callback(err);
                } else {
                    callback();
                }
            });
        },
        function(callback) {
            // Generate token digest
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(token, salt, function(err, hash) {
                    token_digest = hash;
                    callback();
                });
            });
        },
        function(callback) {
            // Seed table
            model.User.create({
                name: 'TestUser',
                vk_user_id: 1,
                nickname: 'TestUser',
                banned: false,
                admin: false,
                token_digest: token_digest

            }).then(function(user) {
                instances.users.push(user);
                model.Topic.create({
                    theme: 'TestTheme',
                    closed: false,
                    UserId: user.id
                }).then(function(topic) {
                    instances.topics.push(topic);
                    model.Opinion.create({
                        content: 'TestContent',
                        root: false,
                        TopicId: topic.id,
                        UserId: user.id
                    }).then(function(opinion) {
                        instances.opinions.push(opinion);
                        callback();
                    }).catch(function(error) {
                        console.log(error);
                        callback(error);
                    });
                }).catch(function(error) {
                    console.log(error);
                    callback(error);
                });
            }).catch(function(error) {
                console.log(error);
                callback(error);
            });

        }
    ], function(err, results) {
        // Finish
        if (err) {
            console.log(err);
            callback(err);
        } else {
            console.log('Seed finished.');
            callback(null, instances);
        }
    });
};
