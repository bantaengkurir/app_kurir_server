'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class courier_rating extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            courier_rating.belongsTo(models.user, {
                foreignKey: "user_id",
                as: "user"
            })
            courier_rating.belongsTo(models.user, {
                foreignKey: "courier_id",
                as: "courier"
            })
        }
    }
    courier_rating.init({
        courier_id: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        rating: DataTypes.INTEGER,
        review: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'courier_rating',
        underscored: true,
    });
    return courier_rating;
};