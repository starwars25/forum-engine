var bodyParser = require('body-parser');
var currentUser = require('../middleware/authorize')();
var notLoggedIn = require('../middleware/not_logged_in');
var model = require('../model');
console.log('Importing opinions');
module.exports = function (app) {
    app.post('/comments', bodyParser.json(), currentUser, notLoggedIn, function(req, res) {
        model.Opinion.findById(req.body.comment.OpinionId).then(function(opinion) {
            if (opinion) {
                model.Comment.create({
                    OpinionId: req.body.comment.OpinionId,
                    UserId: req.currentUser.id,
                    content: req.body.comment.content
                }).then(function(comment) {
                    model.sequelize.query("SELECT Comments.OpinionId, Comments.UserId, Users.nickname AS \"author\", Users.avatar_url, Comments.id, Comments.content FROM Comments INNER JOIN Users ON Users.id = Comments.UserId WHERE Comments.id = ?;", {
                        type: model.sequelize.QueryTypes.SELECT,
                        replacements: [comment.id]
                    }).then(function(data) {
                        res.status(201).json(data[0]);
                    }).catch(function(error) {
                        console.log(error);
                        res.sendStatus(500);
                    });
                }).catch(function(error) {
                    console.log(error);
                    res.sendStatus(400);
                })
            } else {
                res.sendStatus(404);
            }
        }).catch(function(error) {
            console.log(error);
            res.sendStatus(500);
        })
    });
    app.put('/comments/:id', bodyParser.json(), currentUser, notLoggedIn, function(req, res) {
        model.Comment.findById(req.params.id).then(function(comment) {
             if (comment) {
                 if (comment.UserId === req.currentUser.id) {
                     comment.update({
                         content: req.body.comment.content
                     }).then(function(comment) {
                         res.sendStatus(200);
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
    app.delete('/comments/:id', currentUser, notLoggedIn, function(req, res) {
        model.Comment.findById(req.params.id).then(function(comment) {
            if (comment) {
                if (comment.UserId === req.currentUser.id) {
                    comment.destroy().then(function() {
                        res.sendStatus(200);
                    }).catch(function(error) {
                        console.log(error);
                        res.sendStatus(500);
                    })
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
};