'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class product extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            product.hasMany(models.variant, {
                foreignKey: "product_id",
                as: "variant"
            })
            product.belongsTo(models.user, {
                foreignKey: "seller_id",
                as: "seller"
            })
        }
    }
    product.init({
        seller_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        image_url: DataTypes.TEXT,
        price: DataTypes.DECIMAL,
        stock: DataTypes.INTEGER,
        availability: DataTypes.BOOLEAN,
        rating: DataTypes.DECIMAL,
        total_sold: DataTypes.INTEGER,
        discount: DataTypes.DECIMAL,
        category: DataTypes.ENUM('makanan', 'minuman', 'lainnya')
    }, {
        sequelize,
        modelName: 'product',
        underscored: true,
    });
    return product;
};