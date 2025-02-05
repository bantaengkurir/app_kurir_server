'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class courier extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            courier.belongsTo(models.user, {
                foreignKey: "courier_id",
                as: "courier"
            })
        }
    }
    courier.init({
        courier_id: DataTypes.INTEGER,
        vehicle_type: DataTypes.STRING,
        vehicle_plate: DataTypes.STRING,
        availability: DataTypes.ENUM("ready", "unready"),
        rating: DataTypes.DECIMAL
    }, {
        sequelize,
        modelName: 'courier',
        underscored: true,
    });
    return courier;
};