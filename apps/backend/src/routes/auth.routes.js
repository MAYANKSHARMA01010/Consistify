const express = require("express");
const {
    register,
    login,
    logout,
    me,
    refreshToken,
} = require("../controllers/auth.controller");
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

module.exports = authRouter;
