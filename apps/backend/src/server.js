const express = require("express");
const cookieParser = require("cookie-parser");
const corsMiddleware = require("./configs/cors.js");
const authRouter = require("./routes/auth.routes.js");
const tasksRouter = require("./routes/tasks.routes.js");
const dailyStatusRouter = require("./routes/dailyStatus.routes.js");
const summaryRouter = require("./routes/summary.routes.js");
const errorHandler = require("./middlewares/error.middleware.js");
require("dotenv").config();

const app = express();
const PORT = process.env.SERVER_PORT;

app.use(corsMiddleware);
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`DEBUG: NODE_ENV = ${process.env.NODE_ENV}`);
  console.log(`✅ Local Backend URL: ${process.env.BACKEND_LOCAL_URL}`);
  console.log(`✅ Deployed Backend URL: ${process.env.BACKEND_SERVER_URL}`);
});