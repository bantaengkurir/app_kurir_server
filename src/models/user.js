'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class user extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            user.hasMany(models.product, {
                foreignKey: "seller_id",
                as: "product"
            })
            user.hasMany(models.cart, {
                foreignKey: "user_id",
                as: "cart"
            })
            user.hasMany(models.store, {
                foreignKey: "user_id",
                as: "store"
            })
            user.hasMany(models.courier, {
                foreignKey: "courier_id",
                as: "courier"
            })
            user.hasMany(models.order, {
                    foreignKey: "courier_id",
                    as: "orders"
                })
                // user.hasMany(models.location, {
                //     foreignKey: "seller_id",
                //     as: "seller"
                // })
                // user.hasMany(models.location, {
                //     foreignKey: "courier_id",
                //     as: "courierlocation"
                // })
            user.hasMany(models.order, {
                foreignKey: "user_id",
                as: "order"
            })
            user.hasMany(models.courier_rating, {
                foreignKey: "user_id",
                as: "user_rating"
            })
            user.hasMany(models.courier_rating, {
                foreignKey: "courier_id",
                as: "courier_rating"
            })
            user.hasMany(models.notification, {
                foreignKey: "user_id",
                as: "notification"
            })
            user.hasMany(models.financial_report, {
                foreignKey: "seller_id",
                as: "financial_report"
            })
            user.hasMany(models.review, {
                foreignKey: "user_id",
                as: "userreview"
            })
            user.hasMany(models.order_historie, {
                foreignKey: "user_id",
                as: "order_historie"
            })
            user.hasMany(models.message, {
                foreignKey: "sender_id",
                as: "sender"
            })
            user.hasMany(models.message, {
                foreignKey: "receiver_id",
                as: "receiver"
            })
            user.hasMany(models.payment, {
                foreignKey: "user_id",
                as: "payment"
            })
            user.hasMany(models.courier_earning, {
                foreignKey: "courier_id",
                as: "courier_earning"
            })
            user.hasMany(models.seller_earning, {
                foreignKey: "seller_id",
                as: "seller_earning"
            })
        }
    }
    user.init({
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        role: DataTypes.ENUM('admin', 'seller', 'courier', 'customer'),
        address: DataTypes.TEXT,
        latitude: DataTypes.DECIMAL,
        longitude: DataTypes.DECIMAL,
        profile_image: DataTypes.STRING,
        phone_number: DataTypes.STRING,
        gender: DataTypes.ENUM('male', 'famale'),
        date_of_birth: DataTypes.DATE,
        verification_code: DataTypes.STRING,
        is_verified: DataTypes.BOOLEAN,
        last_login_device: DataTypes.STRING,
        status: DataTypes.STRING,
        refresh_token: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'user',
        underscored: true,
    });
    return user;
};