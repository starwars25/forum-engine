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
var Topic = sequelize.define('Topic', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    theme: {
        type: Sequelize.STRING,
        allowNull: false
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    closed: {
        type: Sequelize.BOOLEAN,
        allowNull: false
    },
    closed_at: {
        type: Sequelize.DATE
    }
});
var Opinion = sequelize.define('Opinion', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    }
});
var Comment = sequelize.define('Comment', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    }
});
var Upvote = sequelize.define('Upvote', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    value: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});
User.hasMany(Topic);
Topic.belongsTo(User);
User.hasMany(Opinion);
Opinion.belongsTo(User);
User.hasMany(Comment);
Comment.belongsTo(User);
User.hasMany(Upvote);
Upvote.belongsTo(User);
Topic.hasMany(Opinion);
Opinion.belongsTo(Topic);
Opinion.hasMany(Comment);
Comment.belongsTo(Opinion);
Opinion.hasMany(Upvote);
Upvote.belongsTo(Opinion);

module.exports = {
    User: User,
    Topic: Topic,
    Opinion: Opinion,
    Comment: Comment,
    Upvote: Upvote
};