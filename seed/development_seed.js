process.env.NODE_ENVIRONMENT = 'development';
var model = require('../model');
var bcrypt = require('bcrypt');
var async = require('async');
var faker = require('faker');
var seed = function(token, callback) {
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
                    // Create users
                    var users = [];
                    for(var i = 0; i < 1000; i++) {
                        users.push({
                            name: [faker.name.firstName(), faker.name.lastName()].join(' '),
                            vk_user_id: i,
                            nickname: faker.internet.userName(),
                            banned: false,
                            admin: false,
                            avatar_url: faker.image.avatar(),
                            token_digest: token_digest
                        });
                    }
                    async.each(users, function(item, callback) {
                        model.User.create(item).then(function(instance) {
                            instances.users.push(instance);
                            callback();
                        }).catch(function(error) {
                            callback(error);
                        });
                    }, function(error) {
                        if (error) callback(error);
                        else callback();
                    });
                },
                function(callback) {
                    // Create topics
                    console.log('creating topics');
                    var topics = [];
                    var rootOpinions = [];
                    for(var i = 0; i < 10000; i++) {
                        var UserId = instances.users[Math.floor(Math.random()*instances.users.length)].id;
                        topics.push({
                            UserId: UserId,
                            closed: false,
                            theme: faker.lorem.sentence()
                        });
                        rootOpinions.push({
                            UserId: UserId,
                            root: true,
                            content: faker.lorem.paragraph()
                        });
                    }
                    console.log('prepared data');
                    async.each(topics, function(item, callback) {
                        model.Topic.create(item).then(function(topic) {
                            instances.topics.push(topic);
                            model.Opinion.create({
                                UserId: topic.UserId,
                                root: true,
                                content: faker.lorem.paragraph(),
                                TopicId: topic.id
                            }).then(function(opinion) {
                                instances.opinions.push(opinion);
                                callback();
                            }).catch(function(error) {
                                console.log('catching error');
                                //(error);
                                callback(error)
                            });
                        }).catch(function(error) {
                            console.log('catching error');
                            //(error);
                            callback(error);
                        });
                    }, function (error) {
                        if (error) callback(error);
                        else callback();
                    });
                },
                function (callback) {
                    // Create Opinions
                    console.log('Creating opinions');
                    var opinions = [];
                    for(var i = 0; i < 20000; i++) {
                        var UserId = instances.users[Math.floor(Math.random()*instances.users.length)].id;
                        var TopicId = instances.topics[Math.floor(Math.random()*instances.topics.length)].id;
                        opinions.push({
                            UserId: UserId,
                            TopicId: TopicId,
                            content: faker.lorem.paragraph(),
                            root: false
                        });
                    }
                    async.each(opinions, function(item, callback) {
                        model.Opinion.create(item).then(function(opinion) {
                            instances.opinions.push(opinion);
                            callback();
                        }).catch(function(error) {
                            //(error);
                            callback(error);
                        });
                    }, function(err) {
                        if (err) callback(err);
                        else callback();
                    });
                },
                function(callback) {
                    // Create comments
                    var comments = [];
                    for(var i = 0; i < 50000; i++) {
                        var UserId = instances.users[Math.floor(Math.random()*instances.users.length)].id;
                        var OpinionId = instances.opinions[Math.floor(Math.random()*instances.opinions.length)].id;
                        comments.push({
                            UserId: UserId,
                            OpinionId: OpinionId,
                            content: faker.lorem.sentence()
                        });
                    }
                    async.each(comments, function(item, callback) {
                        model.Comment.create(item).then(function(comment) {
                            instances.comments.push(comment);
                            callback();
                        }).catch(function(error) {
                            callback(error);
                        });
                    }, function(error) {
                        if (error) callback(error);
                        else callback();
                    });
                }
            ], function(err, results) {
                if (err) callback(err);
                else callback();
            })
        }
    ], function(err, results) {
        // Finish
        if (err) {
            //(err);
            callback(err);
        } else {
            //('Seed finished.');
            callback(null, instances);
        }
    });
};
var before = new Date();
seed('token', function(err, instances) {
    if (err) console.log(err);
    else console.log('Seed completed in %d seconds.', (new Date() - before) / 1000);
});