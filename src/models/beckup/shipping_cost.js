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
            shipping_cost.belongsTo(models.store, {
                foreignKey: "store_id",
                as: "stores"
            })
        }
    }
    shipping_cost.init({
        user_id: DataTypes.INTEGER,
        store_id: DataTypes.INTEGER,
        distance: DataTypes.DECIMAL,
        shipping_cost: DataTypes.DECIMAL
    }, {
        sequelize,
        modelName: 'shipping_cost',
        underscored: true,
    });
    return shipping_cost;
};