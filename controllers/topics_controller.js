module.exports = function (app) {
    var model = require('../model');
    var currentUser = require('../middleware/authorize')();
    var notLoggedIn = require('../middleware/not_logged_in');
    var bodyParser = require('body-parser');
    var async = require('async');


    app.post('/topics', bodyParser.json(), currentUser, notLoggedIn, function (req, res) {
        model.Topic.create({
            UserId: req.currentUser.id,
            theme: req.body.topic.theme,
            closed: false
        }).then(function (instance) {
            model.Opinion.create({
                UserId: req.currentUser.id,
                content: req.body.topic.content,
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
        model.Topic.sequelize.query("SELECT Topics.id, Topics.theme, Users.id AS \"user_id\", Users.avatar_url, Users.nickname FROM Topics INNER JOIN Users ON Users.id = Topics.UserId ORDER BY Topics.createdAt DESC", {
            type: model.sequelize.QueryTypes.SELECT
        }).then(function (topics) {
            res.json(topics);
        }).catch(function (error) {
            console.log(error);
            res.sendStatus(500);
        });
    });
    app.get('/topics/:id/', currentUser, function (req, res) {
        var json = {};
        async.parallel([function(callback) {
            model.sequelize.query("SELECT Topics.theme FROM Topics WHERE Topics.id = ?;", {
                replacements: [req.params.id],
                type: model.sequelize.QueryTypes.SELECT
            }).then(function(themes) {
                json.theme = themes[0].theme;
                callback();
            }).catch(function(error) {
                console.log(error);
                callback(error);
            });
        }, function(callback) {
            model.sequelize.query("SELECT Opinions.content, Opinions.id, Users.vk_user_id AS \"user_id\", ")
            callback();
        }], function(error, result) {
            if (error) {
                console.log(error);
                res.sendStatus(500);
            } else {
                res.json(json);
            }
        });
    });
};