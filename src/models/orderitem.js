'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class orderitem extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            orderitem.belongsTo(models.product, {
                foreignKey: "product_id",
                as: "product"
            })
            orderitem.belongsTo(models.order, {
                foreignKey: "order_id",
                as: "order"
            })

        }
    }
    orderitem.init({
        order_id: DataTypes.INTEGER,
        product_id: DataTypes.INTEGER,
        quantity: DataTypes.INTEGER,
        price: DataTypes.DECIMAL,
        discount: DataTypes.DECIMAL,
        total: DataTypes.DECIMAL
    }, {
        sequelize,
        modelName: 'orderitem',
        underscored: true,
    });
    return orderitem;
};