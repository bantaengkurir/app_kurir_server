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
                as: "users"
            })
        }
    }
    notification.init({
        user_id: DataTypes.INTEGER,
        message: DataTypes.TEXT,
        read_status: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'notification',
        underscored: true,
    });
    return notification;
};