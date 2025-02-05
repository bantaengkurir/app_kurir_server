'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class message extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            message.belongsTo(models.user, {
                foreignKey: "sender_id",
                as: "senders"
            })
            message.belongsTo(models.chat, {
                foreignKey: "chat_id",
                as: "chat"
            })
        }
    }
    message.init({
        chat_id: DataTypes.INTEGER,
        sender_id: DataTypes.INTEGER,
        message: DataTypes.TEXT,
        is_read: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'message',
        underscored: true,
    });
    return message;
};