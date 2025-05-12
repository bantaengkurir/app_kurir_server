const cron = require('node-cron');
const { courier: CourierModel } = require('../models');
const { Op } = require('sequelize');

function initCourierAvailabilityCron() {
    cron.schedule('* * * * *', async() => {
        try {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

            await CourierModel.update({ availability: "ready" }, {
                where: {
                    availability: "unready",
                    updatedAt: {
                        [Op.lt]: fiveMinutesAgo
                    }
                }
            });
        } catch (error) {
            console.error("Error in auto-reset job:", error);
        }
    });
}

module.exports = initCourierAvailabilityCron;