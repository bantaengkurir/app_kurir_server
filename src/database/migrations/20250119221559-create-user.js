'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING
            },
            email: {
                type: Sequelize.STRING
            },
            password: {
                type: Sequelize.STRING
            },
            role: {
                type: Sequelize.ENUM('admin', 'seller', 'courier', 'customer'),
                defaultValue: 'customer'
            },
            address: {
                type: Sequelize.TEXT
            },
            latitude: {
                type: Sequelize.DECIMAL(9, 6)
            },
            longitude: {
                type: Sequelize.DECIMAL(9, 6)
            },
            profile_image: {
                type: Sequelize.STRING
            },
            phone_number: {
                type: Sequelize.STRING
            },
            gender: {
                type: Sequelize.ENUM('male', 'famale'),
                defaultValue: 'male'
            },
            date_of_birth: {
                type: Sequelize.DATE
            },
            verification_code: {
                type: Sequelize.STRING
            },
            is_verified: {
                type: Sequelize.BOOLEAN
            },
            last_login_device: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.STRING
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
        await queryInterface.dropTable('users');
    }
};