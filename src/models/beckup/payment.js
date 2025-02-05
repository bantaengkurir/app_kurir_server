'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class payment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            payment.belongsTo(models.order, {
                foreignKey: "order_id",
                as: "orders"
            })
        }
    }
    payment.init({
        order_id: DataTypes.INTEGER,
        payment_method: DataTypes.ENUM('COD', 'transfer'),
        amount: DataTypes.DECIMAL,
        payment_status: DataTypes.ENUM('pending', 'paid', 'failed'),
        payment_date: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'payment',
        underscored: true,
    });
    return payment;
};