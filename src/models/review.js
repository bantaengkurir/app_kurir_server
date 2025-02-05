'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class review extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            review.belongsTo(models.user, {
                foreignKey: "user_id",
                as: "user"
            })
            review.belongsTo(models.product, {
                foreignKey: "product_id",
                as: "product"
            })
        }
    }
    review.init({
        product_id: DataTypes.INTEGER,
        user_id: DataTypes.INTEGER,
        rating: DataTypes.INTEGER,
        comment: DataTypes.TEXT
    }, {
        sequelize,
        modelName: 'review',
        underscored: true,
    });
    return review;
};