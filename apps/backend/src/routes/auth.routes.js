const express = require("express");
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

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, me);

authRouter.post("/refresh", requireRefreshAuth, refreshToken);

authRouter.get("/google", googleLogin);
authRouter.get("/google/callback", googleCallback);

module.exports = authRouter;
