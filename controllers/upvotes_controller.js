var currentUser = require('../middleware/authorize')();
var notLoggedIn = require('../middleware/not_logged_in');
var model = require('../model');
var bodyParser = require('body-parser').json();
module.exports = function(app) {
    app.post('/upvotes', bodyParser, currentUser, notLoggedIn, function(req, res) {
        model.Upvote.findOne({
            where: {
                UserId: req.currentUser.id,
                OpinionId: req.body.upvote.OpinionId
            }
        }).then(function(instance) {
            if (instance) {
                res.sendStatus(403);
            } else {
                model.Upvote.create({
                    UserId: req.currentUser.id,
                    OpinionId: req.body.upvote.OpinionId
                }).then(function(upvote) {
                    model.Devote.findOne({
                        where: {
                            UserId: req.currentUser.id,
                            OpinionId: req.body.upvote.OpinionId
                        }
                    }).then(function(instance) {
                        if (instance) {
                            instance.destroy().then(function(result) {
                                res.sendStatus(201);
                            }).catch(function(error) {
                                console.log(error);
                                res.sendStatus(500);
                            });
                        } else {
                            res.sendStatus(201);
                        }
                    }).catch(function(error) {
                        console.log(error);
                        res.sendStatus(500);
                    });
                }).catch(function(error) {
                    console.log(error);
                    res.sendStatus(400);
                });
            }
        }).catch(function(error) {
            console.log(error);
            res.sendStatus(500);
        });

    });
    app.post('/devotes', bodyParser, currentUser, notLoggedIn, function(req, res) {
        model.Devote.findOne({
            where: {
                UserId: req.currentUser.id,
                OpinionId: req.body.devote.OpinionId
            }
        }).then(function(instance) {
            if (instance) {
                res.sendStatus(403);
            } else {
                model.Devote.create({
                    UserId: req.currentUser.id,
                    OpinionId: req.body.devote.OpinionId
                }).then(function(upvote) {
                    model.Upvote.findOne({
                        where: {
                            UserId: req.currentUser.id,
                            OpinionId: req.body.devote.OpinionId
                        }
                    }).then(function(instance) {
                        if (instance) {
                            instance.destroy().then(function(result) {
                                res.sendStatus(201);
                            }).catch(function(error) {
                                console.log(error);
                                res.sendStatus(500);
                            });
                        } else {
                            res.sendStatus(201);
                        }
                    }).catch(function(error) {
                        console.log(error);
                        res.sendStatus(500);
                    });
                }).catch(function(error) {
                    console.log(error);
                    res.sendStatus(400);
                });
            }
        }).catch(function(error) {
            console.log(error);
            res.sendStatus(500);
        });

    });
};