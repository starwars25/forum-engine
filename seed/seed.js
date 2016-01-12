// Should be called only from tests!
var model = require('../model');
var bcrypt = require('bcrypt');
var async = require('async');
var faker = require('faker');
module.exports = function(token, callback) {
    var instances = {
        users: [],
        topics: [],
        opinions: [],
        upvotes: [],
        devotes: [],
        comments: []
    };

    var token_digest = null;
    async.series([
        function(callback) {
            // Truncate all tables
            var models = [model.User, model.Topic, model.Opinion, model.Comment, model.Upvote, model.Devote];
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
            async.series([
                function(callback) {
                    // create users
                    async.series([
                        function(callback) {
                            model.User.create({
                                name: 'TestUser',
                                vk_user_id: 1,
                                nickname: 'TestUser',
                                banned: false,
                                admin: false,
                                token_digest: token_digest
                            }).then(function(instance) {
                                instances.users.push(instance);
                                callback();
                            }).catch(function(error) {
                                callback(error);
                            })
                        },
                        function(callback) {
                            model.User.create({
                                name: 'AnotherTestUser',
                                vk_user_id: 2,
                                nickname: 'AnotherTestUser',
                                banned: false,
                                admin: false,
                                token_digest: token_digest
                            }).then(function(instance) {
                                instances.users.push(instance);
                                callback();
                            }).catch(function(error) {
                                callback(error);
                            })
                        }
                    ], function(err, res) {
                        if (err) callback(err);
                        else callback();
                    });

                },
                function(callback) {
                    // create topics
                    var topics = [];
                    topics.push({
                        theme: 'TestTheme',
                        closed: false,
                        UserId: instances.users[0].id
                    });
                    for(var i = 0; i < 99; i++) {
                        topics.push({
                            theme: faker.lorem.sentence(),
                            closed: false,
                            UserId: instances.users[0].id
                        });
                    }
                    async.eachSeries(topics, function(item, callback) {
                        model.Topic.create(item).then(function(topic) {
                            instances.topics.push(topic);
                            callback();
                        }).catch(function(error) {
                            callback(error);
                        });
                    }, function(err) {
                        if (err) callback(err);
                        else callback();
                    });
                },
                function(callback) {
                    // create opinions

                    var opinions = [];
                    for(var i = 0; i < 100; i++) {
                        if (i === 0) {
                            opinions.push({
                                content: 'TestContent',
                                root: false,
                                TopicId: instances.topics[0].id,
                                UserId: instances.users[0].id
                            });
                        } else if (i === 1) {
                            opinions.push({
                                content: 'TestContent',
                                root: false,
                                TopicId: instances.topics[0].id,
                                UserId: instances.users[1].id
                            });
                        } else {
                            opinions.push({
                                content: faker.lorem.sentence(),
                                root: false,
                                TopicId: instances.topics[0].id,
                                UserId: instances.users[0].id
                            })
                        }
                    }
                    async.eachSeries(opinions, function(item ,callback) {
                        model.Opinion.create(item).then(function(opinion) {
                            instances.opinions.push(opinion);
                            callback();
                        }).catch(function(error) {
                            callback(error);
                        });
                    }, function(err) {
                        if (err) callback(err);
                        else callback();
                    });

                },
                function(callback) {
                    // create upvotes/devotes
                    model.Devote.create({
                        UserId: instances.users[0].id,
                        OpinionId: instances.opinions[0].id
                    }).then(function (instance) {
                        instances.devotes.push(instance);
                        callback();
                    }).catch(function(error) {
                        callback(error);
                    });
                },
                function(callback) {
                    // create comments
                    async.series([
                        function(callback) {
                            model.Comment.create({
                                UserId: instances.users[0].id,
                                OpinionId: instances.opinions[0].id,
                                content: 'TestComment'
                            }).then(function(comment) {
                                instances.comments.push(comment);
                                callback();
                            }).catch(function(error) {
                                callback(error);
                            })
                        },
                        function(callback) {
                            model.Comment.create({
                                UserId: instances.users[1].id,
                                OpinionId: instances.opinions[0].id,
                                content: 'TestComment'
                            }).then(function(comment) {
                                instances.comments.push(comment);
                                callback();
                            }).catch(function(error) {
                                callback(error);
                            })
                        }
                    ], function(err, res) {
                        if (err) callback(err);
                        else callback();
                    })
                }
            ], function(error, results) {
                if (error) callback(error);
                else callback();
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
