'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class chat extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            chat.belongsTo(models.user, {
                foreignKey: "sender_id",
                as: "senders"
            })
            chat.belongsTo(models.user, {
                foreignKey: "recivier_id",
                as: "reciviers"
            })
            chat.hasMany(models.message, {
                foreignKey: "chat_id",
                as: "messages"
            })
        }
    }
    chat.init({
        sender_id: DataTypes.INTEGER,
        receiver_id: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'chat',
        underscored: true,
    });
    return chat;
};