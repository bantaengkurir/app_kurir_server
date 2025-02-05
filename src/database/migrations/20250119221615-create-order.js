'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('orders', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            user_id: {
                type: Sequelize.INTEGER
            },
            courier_id: {
                type: Sequelize.INTEGER
            },
            status: {
                type: Sequelize.ENUM('pending', 'process', 'cancelled', 'completed'),
                defaultValue: 'pending',
            },
            total_price: {
                type: Sequelize.DECIMAL(10, 2)
            },
            payment_method: {
                type: Sequelize.ENUM('COD', 'transfer'),
                defaultValue: 'COD'
            },
            payment_status: {
                type: Sequelize.ENUM('pending', 'process', 'cancelled', 'completed'),
                defaultValue: 'pending'
            },
            order_code: {
                type: Sequelize.STRING
            },
            order_date: {
                type: Sequelize.DATE
            },
            created_at: {
                allowNull: false,
                defaultValue: Sequelize.fn("NOW"),
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                defaultValue: Sequelize.fn("NOW"),
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('orders');
    }
};