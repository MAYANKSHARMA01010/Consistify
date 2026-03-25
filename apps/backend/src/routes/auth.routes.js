const express = require("express");
const RateLimit = require("express-rate-limit");
const {
    register,
    login,
    logout,
    me,
    refreshToken,
} = require("../controllers/auth.controller");

const {
    googleLogin,
    googleCallback,
} = require("../controllers/googleAuth.controller");

const {
    requireAuth,
    requireRefreshAuth
} = require("../middlewares/auth.middleware");

const authLimiter = RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs for auth routes
});

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", authLimiter, requireAuth, me);

authRouter.post("/refresh", authLimiter, requireRefreshAuth, refreshToken);

authRouter.get("/google", googleLogin);
authRouter.get("/google/callback", authLimiter, googleCallback);

module.exports = authRouter;
