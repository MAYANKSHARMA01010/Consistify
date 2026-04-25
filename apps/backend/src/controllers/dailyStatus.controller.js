const dailyStatusService = require("../services/dailyStatus.service");

const getDailyStatus = async (req, res, next) => {
    try {
        const statuses = await dailyStatusService.getDailyStatus(req.user.id, req.query.date);
        return res.json(statuses);
    } catch (error) {
        next(error);
    }
};

const updateDailyStatus = async (req, res, next) => {
    try {
        const status = await dailyStatusService.updateDailyStatus(req.user.id, req.body);
        return res.json(status);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDailyStatus,
    updateDailyStatus,
};
