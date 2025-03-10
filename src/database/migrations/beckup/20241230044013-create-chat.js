'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('chats', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            sender_id: {
                type: Sequelize.INTEGER
            },
            receiver_id: {
                type: Sequelize.INTEGER
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
        await queryInterface.dropTable('chats');
    }
};