module.exports = function (app) {
    var model = require('../model');
    var currentUser = require('../middleware/authorize')();
    var notLoggedIn = require('../middleware/not_logged_in');
    var bodyParser = require('body-parser');
    var async = require('async');
    var markdown = require('markdown').markdown;


    app.post('/topics', bodyParser.json(), currentUser, notLoggedIn, function (req, res) {
        model.Topic.create({
            UserId: req.currentUser.id,
            theme: req.body.topic.theme,
            closed: false
        }).then(function (instance) {
            var content = markdown.toHTML(req.body.topic.content);
            model.Opinion.create({
                UserId: req.currentUser.id,
                content: content,
                TopicId: instance.id,
                root: true
            }).then(function (instance) {
                res.sendStatus(201);
            }).catch(function (error) {
                console.log(error);
                res.sendStatus(400);
            });
        }).catch(function (err) {
            console.log(err);
            res.sendStatus(400);
        });
    });
    app.get('/topics', function (req, res) {
        console.log(req.query);
        var orderBy = 'Topics.createdAt DESC';
        if (req.query.order) {
            orderBy = 'COUNT(Opinions.id) DESC'
        }
        var json = {};
        async.parallel([
            function(callback) {
                json.page = Number(req.query.page);
                var offset = 20 * (req.query.page - 1);
                model.Topic.sequelize.query("SELECT Topics.id, Topics.theme, Users.id AS \"user_id\", Users.avatar_url, Users.nickname, COUNT(Opinions.id) FROM Topics INNER JOIN Users ON Users.id = Topics.UserId INNER JOIN Opinions ON Opinions.TopicId = Topics.id GROUP BY Topics.id, Topics.theme, user_id, Users.avatar_url, Users.nickname ORDER BY " + orderBy +" LIMIT 20 OFFSET ?;", {
                    type: model.sequelize.QueryTypes.SELECT,
                    replacements: [offset]
                }).then(function (topics) {
                    json.topics = topics;
                    callback();
                }).catch(function (error) {
                    console.log(error);
                    callback(error);
                });
            },
            function(callback) {
                model.sequelize.query("SELECT COUNT(Topics.id) AS \"count\" FROM Topics;", {
                    type: model.sequelize.QueryTypes.SELECT
                }).then(function(data) {
                    console.log(data);
                    json.pageCount = Math.ceil(data[0].count / 20);
                    callback();
                }).catch(function(error) {
                    console.log(error);
                    callback(error);
                });
            }
        ], function(err, results) {
            if (err) {
                console.log(err);
                res.sendStatus(400);
            } else {
                res.json(json);
            }
        })

    });
    app.get('/topics/:id/', currentUser, function (req, res) {
        var json = {};
        async.parallel([function (callback) {
            model.sequelize.query("SELECT Topics.theme FROM Topics WHERE Topics.id = ?;", {
                replacements: [req.params.id],
                type: model.sequelize.QueryTypes.SELECT
            }).then(function (themes) {
                console.log(themes);
                json.theme = themes[0].theme;
                callback();
            }).catch(function (error) {
                console.log(error);
                callback(error);
            });
        }, function (callback) {
            model.sequelize.query('SELECT COUNT(Opinions.id) AS \'count\' FROM Opinions WHERE TopicId = ?', {
                type: model.sequelize.QueryTypes.SELECT,
                replacements: [req.params.id]
            }).then(function(data) {
                json.pageCount = Math.ceil(data[0].count / 20);
                callback();
            }).catch(function(error) {
                console.log(error);
                callback(error);
            })
        }
            , function (callback) {
                json.page = Number(req.query.page);
                var offset = 20 * (req.query.page - 1);
                model.sequelize.query("SELECT Opinions.id, Opinions.content, COUNT(Upvotes.id) AS \"upvotes_count\", COUNT(Devotes.id) AS \"devotes_count\", Users.vk_user_id, Users.nickname, Users.avatar_url FROM Opinions INNER JOIN Users ON Users.id = Opinions.UserId LEFT JOIN Upvotes ON Upvotes.OpinionId = Opinions.id LEFT JOIN Devotes ON Devotes.OpinionId = Opinions.id WHERE Opinions.TopicId = ?  GROUP BY Opinions.id, Opinions.content, Users.vk_user_id, Users.nickname, Users.avatar_url LIMIT 20 OFFSET ?; ", {
                    replacements: [req.params.id, offset],
                    type: model.sequelize.QueryTypes.SELECT
                }).then(function (opinions) {
                    json.opinions = opinions;
                    model.sequelize.query("SELECT Comments.id, Comments.UserId, Comments.OpinionId, Comments.Content, Users.nickname AS \"author\", Users.avatar_url, Users.vk_user_id FROM Comments INNER JOIN Users ON Users.id = Comments.UserId WHERE Comments.OpinionId IN (SELECT Opinions.id FROM Opinions WHERE Opinions.TopicId = ?);", {
                        type: model.sequelize.QueryTypes.SELECT,
                        replacements: [req.params.id]
                    }).then(function (data) {
                        console.log(data);
                        for (var i = 0; i < data.length; i++) {
                            var comment = data[i];
                            for (var j = 0; j < json.opinions.length; j++) {
                                var opinion = json.opinions[j];
                                if (opinion.id === comment.OpinionId) {
                                    if (opinion.comments) {
                                        opinion.comments.push(comment);
                                    } else {
                                        opinion.comments = [];
                                        opinion.comments.push(comment);
                                    }
                                    break;
                                }
                            }
                        }
                        callback();
                    }).catch(function (err) {
                        callback(err);
                    });
                }).catch(function (error) {
                    console.log(error);
                    callback(error);
                });
            }, function (callback) {
                if (req.currentUser) {
                    var votes = {
                        upvotes: {},
                        devotes: {}
                    };
                    async.parallel([
                        function (callback) {
                            model.sequelize.query("SELECT Upvotes.id, Upvotes.OpinionId FROM Topics INNER JOIN Opinions ON Topics.id = Opinions.TopicId INNER JOIN Upvotes ON Upvotes.OpinionId = Opinions.id WHERE Topics.id = ? AND Upvotes.UserId = ?;", {
                                replacements: [req.params.id, req.currentUser.id],
                                type: model.sequelize.QueryTypes.SELECT
                            }).then(function (data) {
                                for (var i = 0; i < data.length; i++) {
                                    var upvote = data[i];
                                    votes.upvotes[upvote.OpinionId] = upvote.id;
                                }
                                callback();
                            }).catch(function (error) {
                                console.log(error);
                                callback(error);
                            });
                        },
                        function (callback) {
                            model.sequelize.query("SELECT Devotes.id, Devotes.OpinionId FROM Topics INNER JOIN Opinions ON Topics.id = Opinions.TopicId INNER JOIN Devotes ON Devotes.OpinionId = Opinions.id WHERE Topics.id = ? AND Devotes.UserId = ?;", {
                                replacements: [req.params.id, req.currentUser.id],
                                type: model.sequelize.QueryTypes.SELECT
                            }).then(function (data) {
                                console.log(data);
                                for (var i = 0; i < data.length; i++) {
                                    var devote = data[i];
                                    votes.devotes[devote.OpinionId] = devote.id;
                                }
                                console.log(votes.devotes);
                                callback();
                            }).catch(function (error) {
                                console.log(error);
                                callback(error);
                            });
                        }
                    ], function (err, result) {
                        json.votes = votes;
                        callback();
                    });
                } else {
                    callback();
                }
            }
        ], function (error, result) {
            if (error) {
                console.log(error);
                res.sendStatus(500);
            } else {
                res.json(json);
            }
        });
    });
};