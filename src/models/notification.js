'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class notification extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            notification.belongsTo(models.user, {
                foreignKey: "user_id",
                as: "user"
            })
            notification.belongsTo(models.user, {
                foreignKey: "seller_id",
                as: "seller"
            })
            notification.belongsTo(models.user, {
                foreignKey: "courier_id",
                as: "courier"
            })
        }
    }
    notification.init({
        user_id: DataTypes.INTEGER,
        seller_id: DataTypes.INTEGER,
        courier_id: DataTypes.INTEGER,
        message: DataTypes.TEXT,
        read_status: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'notification',
        underscored: true,
    });
    return notification;
};