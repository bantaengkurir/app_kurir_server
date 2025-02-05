'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('stores', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            user_id: {
                type: Sequelize.INTEGER
            },
            store_name: {
                type: Sequelize.STRING
            },
            store_description: {
                type: Sequelize.TEXT
            },
            store_logo: {
                type: Sequelize.TEXT
            },
            store_address: {
                type: Sequelize.TEXT
            },
            store_phone: {
                type: Sequelize.STRING
            },
            store_status: {
                type: Sequelize.ENUM('active', 'inactive'),
                defaultValue: 'inactive'
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
        await queryInterface.dropTable('stores');
    }
};