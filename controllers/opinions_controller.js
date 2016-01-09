var bodyParser = require('body-parser');
var currentUser = require('../middleware/authorize')();
var notLoggedIn = require('../middleware/not_logged_in');
var model = require('../model');
console.log('Importing opinions');
module.exports = function (app) {

    app.post('/opinions', bodyParser.json(), currentUser, notLoggedIn, function (req, res, next) {
        console.log('Creating opinion');
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
};