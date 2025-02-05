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
            user.hasMany(models.store, {
                foreignKey: "user_id",
                as: "store"
            })
            user.hasMany(models.order, {
                foreignKey: "user_id",
                as: "order"
            })
            user.hasMany(models.order, {
                foreignKey: "seller_id",
                as: "order_seller"
            })
            user.hasMany(models.order, {
                foreignKey: "courier_id",
                as: "order_courier"
            })
            user.hasMany(models.courier_rating, {
                foreignKey: "user_id",
                as: "courier_rating"
            })
            user.hasMany(models.courier_rating, {
                foreignKey: "courier_id",
                as: "courier_ratings"
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
                as: "review"
            })
            user.hasMany(models.order_historie, {
                foreignKey: "user_id",
                as: "order_historie"
            })
            user.hasMany(models.location_tracking, {
                foreignKey: "courier_id",
                as: "location_tracking"
            })
            user.hasMany(models.chat, {
                foreignKey: "recivier_id",
                as: "recivier_chat"
            })
            user.hasMany(models.chat, {
                foreignKey: "sender_id",
                as: "sender_chat"
            })
            user.hasMany(models.message, {
                foreignKey: "sender_id",
                as: "message"
            })

        }
    }
    user.init({
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        role: DataTypes.ENUM('admin', 'seller', 'courier', 'customer'),
        address: DataTypes.TEXT,
        profile_image: DataTypes.STRING,
        phone_number: DataTypes.STRING,
        gender: DataTypes.ENUM('male', 'female'),
        date_of_birth: DataTypes.DATE,
        verification_code: DataTypes.STRING, // Verification code
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false, // Default value
        },


    }, {
        sequelize,
        modelName: 'user',
        underscored: true,
    });
    return user;
};