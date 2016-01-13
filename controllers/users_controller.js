module.exports = function (app) {
    var currentUser = require('../middleware/authorize')();
    var notLoggedIn = require('../middleware/not_logged_in');
    var model = require('../model');
    var bodyParser = require('body-parser');
    app.get('/current-user', currentUser, notLoggedIn, function (req, res) {
        model.sequelize.query("SELECT DISTINCT Topics.id, Topics.theme FROM Topics LEFT JOIN Opinions ON Opinions.TopicId = Topics.id AND Opinions.UserId = ? WHERE Topics.UserId = ? ", {
            replacements: [req.currentUser.id, req.currentUser.id],
            type: model.sequelize.QueryTypes.SELECT
        }).then(function (topics) {
            console.log(topics);
            var json = {
                name: req.currentUser.name,
                nickname: req.currentUser.nickname,
                avatar_url: req.currentUser.avatar_url,
                topics: topics
            };
            res.json(json);
        }).catch(function (error) {
            console.log(error);
            res.sendStatus(500);
        });
    });
    app.put('/update-user', bodyParser.json(), currentUser, notLoggedIn, function (req, res) {
        var params = {};
        if (req.body.nickname) params.nickname = req.body.nickname;
        if (req.body.avatar_url) {
            params.avatar_url = req.body.avatar_url;
            params.own_avatar = true;
        }
        req.currentUser.update(params).then(function (instance) {
            res.sendStatus(201);
        }).catch(function (error) {
            console.log(error);
            res.sendStatus(400);
        });
    });
};