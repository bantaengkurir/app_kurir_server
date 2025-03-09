'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class courier_earning extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            courier_earning.belongsTo(models.user, {
                foreignKey: "courier_id",
                as: "courier"
            })
        }
    }
    courier_earning.init({
        order_id: DataTypes.INTEGER,
        courier_id: DataTypes.INTEGER,
        amount: DataTypes.DECIMAL,
        courier_earning: DataTypes.DECIMAL,
        earning_date: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'courier_earning',
        underscored: true,
    });
    return courier_earning;
};