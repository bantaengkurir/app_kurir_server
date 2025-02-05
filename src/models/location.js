'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class location extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            location.belongsTo(models.user, {
                foreignKey: "user_id",
                as: "user"
            })
            location.belongsTo(models.user, {
                foreignKey: "seller_id",
                as: "seller"
            })
            location.belongsTo(models.user, {
                foreignKey: "courier_id",
                as: "courier"
            })
        }
    }
    location.init({
        user_id: DataTypes.INTEGER,
        seller_id: DataTypes.INTEGER,
        courier_id: DataTypes.INTEGER,
        latitude: DataTypes.DECIMAL,
        longitude: DataTypes.DECIMAL
    }, {
        sequelize,
        modelName: 'location',
        underscored: true,
    });
    return location;
};