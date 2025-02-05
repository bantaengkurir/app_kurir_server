'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class shipping_cost extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            shipping_cost.belongsTo(models.order, {
                foreignKey: "order_id",
                as: "order"
            })
        }
    }
    shipping_cost.init({
        order_id: DataTypes.INTEGER,
        address: DataTypes.STRING,
        latitude: DataTypes.DECIMAL,
        longitude: DataTypes.DECIMAL,
        distance: DataTypes.DECIMAL,
        shipping_cost: DataTypes.DECIMAL
    }, {
        sequelize,
        modelName: 'shipping_cost',
        underscored: true,
    });
    return shipping_cost;
};