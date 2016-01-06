var Sequelize = require('sequelize');
console.log(process.env.NODE_ENVIRONMENT);
var path = __dirname + '/db/';
var database = null;
switch (process.env.NODE_ENVIRONMENT) {
    case 'test':
        database = 'test';
        path += 'test.sqlite';
        break;
    default:
        database = 'development';
        path += 'development.sqlite';
        break;
}
var sequelize = new Sequelize(database, null, null, {
    host: 'localhost',
    dialect: 'sqlite',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    storage: path
});
var User = sequelize.define('User', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    nickname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    avatar_url: {
        type: Sequelize.STRING
    },
    banned: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    banned_until: {
        type: Sequelize.DATE
    },
    admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    }
});
module.exports = {
    User: User
};