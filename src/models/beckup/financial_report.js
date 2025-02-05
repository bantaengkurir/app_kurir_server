'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class financial_report extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            financial_report.belongsTo(models.user, {
                foreignKey: "seller_id",
                as: "sellers"
            })
        }
    }
    financial_report.init({
        seller_id: DataTypes.INTEGER,
        start_date: DataTypes.DATE,
        end_date: DataTypes.DATE,
        total_revenue: DataTypes.DECIMAL,
        total_shipping_cost: DataTypes.DECIMAL,
        net_income: DataTypes.DECIMAL
    }, {
        sequelize,
        modelName: 'financial_report',
        underscored: true,
    });
    return financial_report;
};