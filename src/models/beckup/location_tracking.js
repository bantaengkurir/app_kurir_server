'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class location_tracking extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            location_tracking.belongsTo(models.user, {
                foreignKey: "courier_id",
                as: "couriers"
            })
        }
    }
    location_tracking.init({
        courier_id: DataTypes.INTEGER,
        latitude: DataTypes.DECIMAL,
        longitude: DataTypes.DECIMAL
    }, {
        sequelize,
        modelName: 'location_tracking',
        underscored: true,
    });
    return location_tracking;
};