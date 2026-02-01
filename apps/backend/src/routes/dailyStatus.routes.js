const express = require("express");
const {
    getDailyStatus,
    updateDailyStatus,
} = require("../controllers/dailyStatus.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const dailyStatusRouter = express.Router();

dailyStatusRouter.use(requireAuth);

dailyStatusRouter.get("/", getDailyStatus);
dailyStatusRouter.post("/", updateDailyStatus);

module.exports = dailyStatusRouter;
