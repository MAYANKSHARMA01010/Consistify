const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const corsMiddleware = require("./configs/cors.js");
const authRouter = require("./routes/auth.routes.js");
const tasksRouter = require("./routes/tasks.routes.js");
const dailyStatusRouter = require("./routes/dailyStatus.routes.js");
const summaryRouter = require("./routes/summary.routes.js");
const errorHandler = require("./middlewares/error.middleware.js");

const app = express();

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(corsMiddleware);
app.use(helmet());
app.use(globalLimiter);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/daily-status", dailyStatusRouter);
app.use("/api/summary", summaryRouter);

app.get("/", (req, res) => {
  res.status(200).send("<h1>Backend Running Successfully 🚀</h1>");
});

app.use(errorHandler);

module.exports = app;
