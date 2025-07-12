'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('products', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            seller_id: {
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING
            },
            description: {
                type: Sequelize.TEXT
            },
            image_url: {
                type: Sequelize.TEXT
            },
            price: {
                type: Sequelize.DECIMAL(10, 2)
            },
            stock: {
                type: Sequelize.INTEGER
            },
            availability: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            rating: {
                type: Sequelize.DECIMAL(3, 2)
            },
            total_sold: {
                type: Sequelize.INTEGER
            },
            discount: {
                type: Sequelize.DECIMAL(10, 2)
            },
            category: {
                type: Sequelize.ENUM('makanan', 'minuman', 'lainnya'),
                defaultValue: 'makanan'
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
        await queryInterface.dropTable('products');
    }
};