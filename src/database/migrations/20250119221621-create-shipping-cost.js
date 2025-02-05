'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('shipping_costs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            order_id: {
                type: Sequelize.INTEGER
            },
            address: {
                type: Sequelize.STRING
            },
            latitude: {
                type: Sequelize.DECIMAL(9, 6)
            },
            longitude: {
                type: Sequelize.DECIMAL(9, 6)
            },
            distance: {
                type: Sequelize.DECIMAL(10, 2)
            },
            shipping_cost: {
                type: Sequelize.DECIMAL(10, 2)
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
        await queryInterface.dropTable('shipping_costs');
    }
};