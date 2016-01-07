var model = require('./model');
model.sequelize.query("SELECT * FROM Topics;", {
    type: model.sequelize.QueryTypes.SELECT
}).then(function(response) {
    console.log(response);
});