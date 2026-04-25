const express = require("express");
const RateLimit = require("express-rate-limit");
const validateRequest = require("../middlewares/validateRequest.middleware");
const {
    registerSchema,
    loginSchema,
    requestEmailVerificationSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} = require("../validators/auth.validators");
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
    dismissBanner,
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

authRouter.post("/register", authSensitiveLimiter, validateRequest(registerSchema), register);
authRouter.post("/login", authSensitiveLimiter, validateRequest(loginSchema), login);
authRouter.post("/logout", logout);
authRouter.post("/verify-email/request", authSensitiveLimiter, validateRequest(requestEmailVerificationSchema), requestEmailVerification);
authRouter.post("/verify-email", authSensitiveLimiter, validateRequest(verifyEmailSchema), verifyEmail);
authRouter.post("/forgot-password", authSensitiveLimiter, validateRequest(forgotPasswordSchema), forgotPassword);
authRouter.post("/reset-password", authSensitiveLimiter, validateRequest(resetPasswordSchema), resetPassword);
authRouter.get("/me", authLimiter, requireAuth, me);
authRouter.post("/dismiss-banner", authLimiter, requireAuth, dismissBanner);

authRouter.post("/refresh", authLimiter, requireRefreshAuth, refreshToken);

authRouter.get("/google", googleLogin);
authRouter.get("/google/callback", authLimiter, googleCallback);

module.exports = authRouter;
