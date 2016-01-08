require('./environment')();
var express = require('express');
var util = require('util');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
app.use(cookieParser());
var model = require('./model');
var async = require('async');
app.use(function (req, res, next) {
    console.log(req.path);
    next();
});
require('./authenticate')(app);
var currentUser = require('./authorize')(app);
var notLoggedIn = function (req, res, next) {
    if (req.currentUser) {
        next();
    } else {
        console.log('Not logged in');
        res.sendStatus(401);
    }
};
app.get('/', function (req, res) {
    res.sendFile(util.format('%s/public/layout.html', __dirname));
});
app.get('/current-user', currentUser, notLoggedIn, function (req, res) {
    model.sequelize.query("SELECT DISTINCT Topics.id, Topics.theme FROM Topics LEFT JOIN Opinions ON Opinions.TopicId = Topics.id AND Opinions.UserId = ? WHERE Topics.UserId = ? ", {
        replacements: [req.currentUser.id, req.currentUser.id],
        type: model.sequelize.QueryTypes.SELECT
    }).then(function (topics) {
        var json = {
            name: req.currentUser.name,
            nickname: req.currentUser.nickname,
            avatar_url: req.currentUser.avatar_url,
            topics: topics

        };
        res.json(json);
    }).catch(function (error) {
        res.sendStatus(500);
    });


});
app.put('/update-user', bodyParser.json(), currentUser, notLoggedIn, function (req, res) {
    req.currentUser.update({nickname: req.body.nickname}).then(function (instance) {
        res.sendStatus(201);
    }).catch(function (error) {
        res.sendStatus(400);
    });
});
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
app.get('/topics/:id/opinions', function (req, res) {

    var json = {};
    async.parallel([function (callback) {
        model.Opinion.sequelize.query("SELECT Opinions.id, Opinions.content, Users.vk_user_id, Users.nickname, Users.avatar_url FROM Opinions INNER JOIN Users ON Users.id = Opinions.UserId WHERE Opinions.TopicId = ?;", {
            type: model.sequelize.QueryTypes.SELECT,
            replacements: [req.params.id]
        }).then(function (opinions) {
            json.opinions = opinions;
            callback();
        }).catch(function (error) {
            callback(error);
        });
    }, function (callback) {
        model.Opinion.sequelize.query("SELECT Topics.theme FROM Topics  WHERE Topics.id = ?;", {
            type: model.sequelize.QueryTypes.SELECT,
            replacements: [req.params.id]
        }).then(function (topics) {
            try {
                json.theme = topics[0].theme;
                callback();

            } catch (e) {
                callback(e);
            }
        }).catch(function (error) {
            callback(error);
        });
    }], function (err, result) {
        if (err) {
            console.log(err);
            res.sendStatus(400);
        } else {
            res.json(json);
        }
    });
});
app.post('/opinions', bodyParser.json(), currentUser, notLoggedIn, function (req, res, next) {
    model.Opinion.create({
        content: req.body.opinion.content,
        UserId: req.currentUser.id,
        TopicId: req.body.opinion.topic_id,
        root: false
    }).then(function (instance) {
        res.sendStatus(201);
    }).catch(function (error) {
        console.log(error);
        res.sendStatus(400);
    });
});
app.put('/opinions/:id', bodyParser.json(), currentUser, notLoggedIn, function(req, res) {
    model.Opinion.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(instance) {
        if (instance) {
            if (instance.UserId === req.currentUser.id) {
                instance.update({
                    content: req.body.opinion.content
                }).then(function(instance) {
                    res.sendStatus(201);
                }).catch(function(error) {
                    console.log(error);
                    res.sendStatus(400);
                });
            } else {
                res.sendStatus(403);
            }
        } else {
            res.sendStatus(404);
        }
    }).catch(function(error) {
        console.log(error);
        res.sendStatus(500);
    });
});
app.use(express.static('public'));
var server = app.listen(3000, function () {
    console.log('Listening on %d', server.address().port);
});