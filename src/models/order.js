'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class order extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here

            order.hasMany(models.orderitem, {
                foreignKey: "order_id",
                as: "orderitem"
            })
            order.hasMany(models.payment, {
                foreignKey: "order_id",
                as: "payment"
            })
            order.hasMany(models.order_historie, {
                foreignKey: "order_id",
                as: "order_historie"
            })
            order.hasMany(models.shipping_cost, {
                foreignKey: "order_id",
                as: "shipping_cost"
            })
            order.belongsTo(models.user, {
                foreignKey: "user_id",
                as: "user"
            })
            order.belongsTo(models.user, {
                foreignKey: "courier_id",
                as: "couriers"
            })
        }
    }
    order.init({
        user_id: DataTypes.INTEGER,
        courier_id: DataTypes.INTEGER,
        status: DataTypes.ENUM('pending', 'process', 'cancelled', 'completed'),
        total_price: DataTypes.DECIMAL,
        payment_method: DataTypes.ENUM('COD', 'transfer'),
        payment_status: DataTypes.ENUM('pending', 'process', 'cancelled', 'completed'),
        order_code: DataTypes.STRING,
        order_date: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'order',
        underscored: true,
    });
    return order;
};