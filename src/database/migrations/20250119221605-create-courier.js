'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('couriers', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            courier_id: {
                type: Sequelize.INTEGER
            },
            vehicle_type: {
                type: Sequelize.STRING
            },
            vehicle_plate: {
                type: Sequelize.STRING
            },
            availability: {
                type: Sequelize.ENUM("ready", "unready"),
                defaultValue: "unready"
            },
            rating: {
                type: Sequelize.DECIMAL
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
        await queryInterface.dropTable('couriers');
    }
};