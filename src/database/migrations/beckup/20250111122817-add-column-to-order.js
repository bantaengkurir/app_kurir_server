'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.addColumn('orders', 'address', {
            type: Sequelize.STRING,
            allowNull: true, // Perbolehkan nilai null
            defaultValue: null, // Default-nya null
        });
        await queryInterface.addColumn('orders', 'order_date', {
            type: Sequelize.DATE,
            allowNull: true, // Perbolehkan nilai null
            defaultValue: null, // Default-nya null
        });
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.removeColumn('orders', 'address');
        await queryInterface.removeColumn('orders', 'order_detail');
    },
};