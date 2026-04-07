const express = require("express");
const RateLimit = require("express-rate-limit");
const {
    register,
    login,
    logout,
    me,
    refreshToken,
    requestEmailVerification,
    verifyEmail,
    forgotPassword,
    resetPassword,
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
    windowMs: 15 * 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
});

const authSensitiveLimiter = RateLimit({
    windowMs: 15 * 60 * 1000,
    max: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many attempts. Please try again in a few minutes.",
    },
});

const authRouter = express.Router();

authRouter.post("/register", authSensitiveLimiter, register);
authRouter.post("/login", authSensitiveLimiter, login);
authRouter.post("/logout", logout);
authRouter.post("/verify-email/request", authSensitiveLimiter, requestEmailVerification);
authRouter.post("/verify-email", authSensitiveLimiter, verifyEmail);
authRouter.post("/forgot-password", authSensitiveLimiter, forgotPassword);
authRouter.post("/reset-password", authSensitiveLimiter, resetPassword);
authRouter.get("/me", authLimiter, requireAuth, me);

authRouter.post("/refresh", authLimiter, requireRefreshAuth, refreshToken);

authRouter.get("/google", googleLogin);
authRouter.get("/google/callback", authLimiter, googleCallback);

module.exports = authRouter;
