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
require('./controllers/authentication_controller')(app);
var currentUser = require('./middleware/authorize')(app);
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
require('./controllers/users_controller')(app);
require('./controllers/topics_controller')(app);
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
app.put('/opinions/:id', bodyParser.json(), currentUser, notLoggedIn, function (req, res) {
    model.Opinion.findOne({
        where: {
            id: req.params.id
        }
    }).then(function (instance) {
        if (instance) {
            if (instance.UserId === req.currentUser.id) {
                instance.update({
                    content: req.body.opinion.content
                }).then(function (instance) {
                    res.sendStatus(201);
                }).catch(function (error) {
                    console.log(error);
                    res.sendStatus(400);
                });
            } else {
                res.sendStatus(403);
            }
        } else {
            res.sendStatus(404);
        }
    }).catch(function (error) {
        console.log(error);
        res.sendStatus(500);
    });
});
app.post('/upvotes', bodyParser.json(), currentUser, notLoggedIn, function (req, res) {
    if (req.body.upvote.opinion_id) {
        model.Upvote.findAll({
            where: {
                UserId: req.currentUser.id,
                OpinionId: req.body.upvote.opinion_id
            }
        }).then(function (upvotes) {
            if (upvotes.length > 0) {
                res.sendStatus(400);
            } else {
                var content = req.body.upvote.content;
                if (content && (content === 1 || content === -1)) {
                    model.Upvote.create({
                        UserId: req.currentUser.id,
                        OpinionId: req.body.upvote.opinion_id,
                        content: req.body.upvote.content
                    }).then(function (instance) {
                        model.Opinion.findById(instance.OpinionId).then(function (instane) {
                            instane.update({
                                rating: instane.rating + content
                            }).then(function (instance) {
                                res.sendStatus(201);
                            }).catch(function (error) {
                                console.log(error);
                                res.sendStatus(500);
                            });
                        });
                    }).catch(function (error) {
                        console.log(error);
                    });
                } else {
                    res.sendStatus(400);
                }
            }
        }).catch(function (error) {
            console.log(error);
            res.sendStatus(500);
        });
    } else {
        res.sendStatus(400);
    }
});
app.put('/upvotes/:id', bodyParser.json(), currentUser, notLoggedIn, function (req, res) {
    model.Upvote.findOne({
        where: {
            UserId: req.currentUser.id,
            OpinionId: req.params.id
        }
    }).then(function (instance) {
        var content = req.body.upvote.content;
        if (content && (content === 1 || content === -1)) {
            instance.update({content: content}).then(function (instance) {
                model.Opinion.findById(instance.OpinionId).then(function (instane) {
                    instane.update({
                        rating: instane.rating + content
                    }).then(function (instance) {
                        res.sendStatus(201);
                    }).catch(function (error) {
                        console.log(error);
                        res.sendStatus(500);
                    });
                });
            }).catch(function (error) {
                console.log(error);
                res.sendStatus(400);
            });
        } else {
            res.sendStatus(400);
        }
    }).catch(function (error) {
        console.log(error);
        res.sendStatus(400);
    });
});
app.use(express.static('public'));
var server = app.listen(3000, function () {
    console.log('Listening on %d', server.address().port);
});