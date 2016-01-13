console.log('\n\n\n\n\n\nLOADING MODEL\n\n\n\n\n')
var Sequelize = require('sequelize');
console.log(process.env.NODE_ENVIRONMENT);
var path = __dirname + '/db/';
var database = null;
var logging;
switch (process.env.NODE_ENVIRONMENT) {
    case 'test':
        database = 'test';
        path += 'test.sqlite';
        logging = false;
        break;
    default:
        database = 'development';
        path += 'development.sqlite';
        logging = true;
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
    storage: path,
    logging: logging
});
var User = sequelize.define('User', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    vk_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    nickname: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [4, 50]
        }
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
    },
    token_digest: {
        type: Sequelize.STRING,
        allowNull: false
    },
    own_avatar: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
        allowNull: false,
        validate: {
            len: [4, 140]
        }
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
        allowNull: false,
        validate: {
            len: [2]

        }
    },
    root: {
        type: Sequelize.BOOLEAN,
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
        allowNull: false,
        validate: {
            len: [2]
        }
    }
});
var Upvote = sequelize.define('Upvote', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }

});
var Devote = sequelize.define('Devote', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
User.hasMany(Devote);
Devote.belongsTo(User);
Topic.hasMany(Opinion);
Opinion.belongsTo(Topic);
Opinion.hasMany(Comment);
Comment.belongsTo(Opinion);
Opinion.hasMany(Upvote);
Upvote.belongsTo(Opinion);
Opinion.hasMany(Devote);
Devote.belongsTo(Opinion);

module.exports = {
    User: User,
    Topic: Topic,
    Opinion: Opinion,
    Comment: Comment,
    Upvote: Upvote,
    Devote: Devote,
    sequelize: sequelize
};