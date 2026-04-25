const authService = require("../services/auth.service");

const register = async (req, res, next) => {
    try {
        const result = await authService.registerUser(req.body);
        const response = {
            success: true,
            message: "User registered successfully. Please verify your email.",
        };

        if (!authService.isProd && result.verifyToken) {
            response.verifyToken = result.verifyToken;
        }

        return res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { accessToken, refreshToken, isProd } = await authService.loginUser(email, password);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
        });

        return res.json({ success: true, message: "Login successful" });
    } catch (error) {
        next(error);
    }
};

const logout = (req, res, next) => {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        next(error);
    }
};

const me = async (req, res, next) => {
    try {
        const user = await authService.getUserById(req.user.id);
        return res.json(user);
    } catch (error) {
        next(error);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.cookies;
        const { accessToken, refreshToken: newRefreshToken, isProd } = authService.refreshAuthToken(token);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
        });

        return res.json({ success: true, message: "Refresh token successful" });
    } catch (error) {
        next(error);
    }
};

const requestEmailVerification = async (req, res, next) => {
    try {
        const { email } = req.body;
        const verifyToken = await authService.requestEmailVerification(email);

        if (!verifyToken) {
             return res.json({ success: true, message: "If the account exists or is unverified, a verification link has been sent" });
        }

        const response = {
            success: true,
            message: "If the account exists, a verification link has been sent",
        };

        if (!authService.isProd) {
            response.verifyToken = verifyToken;
        }

        return res.json(response);
    } catch (error) {
        next(error);
    }
};

const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.body;
        await authService.verifyEmail(token);
        return res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const resetToken = await authService.forgotPassword(email);

        const response = {
            success: true,
            message: "If the account exists, a reset link has been sent",
        };

        if (!authService.isProd && resetToken) {
            response.resetToken = resetToken;
        }

        return res.json(response);
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        await authService.resetPassword(token, password);
        return res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        next(error);
    }
};

const dismissBanner = async (req, res, next) => {
    try {
        await authService.dismissBanner(req.user.id);
        return res.json({ success: true, message: "Banner dismissed" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
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
};
