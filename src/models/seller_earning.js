'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class seller_earning extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            seller_earning.belongsTo(models.user, {
                foreignKey: "seller_id",
                as: "seller"
            })
        }
    }
    seller_earning.init({
        order_id: DataTypes.INTEGER,
        seller_id: DataTypes.INTEGER,
        product_id: DataTypes.INTEGER,
        amount: DataTypes.DECIMAL,
        seller_earning: DataTypes.DECIMAL,
        earning_date: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'seller_earning',
        underscored: true,
    });
    return seller_earning;
};