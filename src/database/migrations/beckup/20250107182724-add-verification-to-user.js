module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.addColumn("Users", "verification_code", {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn("Users", "is_verified", {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        });
    },
    down: async(queryInterface, Sequelize) => {
        await queryInterface.removeColumn("Users", "verification_code");
        await queryInterface.removeColumn("Users", "is_verified");
    },
};