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
                as: "sender"
            })
            message.belongsTo(models.user, {
                foreignKey: "receiver_id",
                as: "receiver"
            })
        }
    }
    message.init({
        sender_id: DataTypes.INTEGER,
        receiver_id: DataTypes.INTEGER,
        text: DataTypes.TEXT,
        img_url: DataTypes.TEXT,
        is_read: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'message',
        underscored: true,
    });
    return message;
};