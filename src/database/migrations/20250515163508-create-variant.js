'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('variants', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            product_id: {
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING
            },
            img_url: {
                type: Sequelize.TEXT
            },
            price: {
                type: Sequelize.DECIMAL
            },
            sku: {
                type: Sequelize.STRING
            },
            stock: {
                type: Sequelize.INTEGER,
            },
            type: {
                type: Sequelize.ENUM('regular', 'pre order'),
                defaultValue: 'regular'
            },
            is_available: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
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
        await queryInterface.dropTable('variants');
    }
};