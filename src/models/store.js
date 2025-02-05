'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class store extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            store.belongsTo(models.user, {
                foreignKey: "seller_id",
                as: "seller"
            })
        }
    }
    store.init({
        seller_id: DataTypes.INTEGER,
        store_name: DataTypes.STRING,
        store_description: DataTypes.TEXT,
        store_logo: DataTypes.STRING,
        store_address: DataTypes.TEXT,
        store_phone: DataTypes.STRING,
        store_status: DataTypes.ENUM('active', 'inactive')
    }, {
        sequelize,
        modelName: 'store',
        underscored: true,
    });
    return store;
};