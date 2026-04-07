const prisma = require("../configs/prisma");
const ApiError = require("../utils/ApiError");
const { sendEmail } = require("../utils/mailer");
const { generateToken, hashToken } = require("../utils/authToken");

const {
    hashPassword,
    comparePassword
} = require("../utils/hash");

const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} = require("../utils/jwt");

const isProd = process.env.NODE_ENV === "production";

const getFrontendBaseUrl = () => {
    if (isProd) {
        return process.env.FRONTEND_SERVER_URL;
    }
    return process.env.FRONTEND_LOCAL_URL;
};

const createAuthToken = async (userId, type, ttlMinutes) => {
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await prisma.authToken.create({
        data: {
            userId,
            tokenHash,
            type,
            expiresAt,
        },
    });

    return rawToken;
};

const invalidateActiveTokens = async (userId, type) => {
    await prisma.authToken.updateMany({
        where: {
            userId,
            type,
            usedAt: null,
            expiresAt: { gt: new Date() },
        },
        data: {
            usedAt: new Date(),
        },
    });
};

const sendVerificationEmail = async (user, rawToken) => {
    const baseUrl = getFrontendBaseUrl();
    if (!baseUrl) {
        return;
    }

    const verifyUrl = `${baseUrl}/verify-email?token=${rawToken}`;

    await sendEmail({
        to: user.email,
        subject: "Verify your Consistify account",
        text: `Welcome to Consistify, ${user.name}. Verify your email: ${verifyUrl}`,
        html: `<p>Welcome to Consistify, ${user.name}.</p><p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
    });
};

const sendResetPasswordEmail = async (user, rawToken) => {
    const baseUrl = getFrontendBaseUrl();
    if (!baseUrl) {
        return;
    }

    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    await sendEmail({
        to: user.email,
        subject: "Reset your Consistify password",
        text: `Reset your password using this link: ${resetUrl}`,
        html: `<p>Reset your password by clicking <a href="${resetUrl}">this link</a>.</p>`,
    });
};


const register = async (req, res, next) => {
    try {
        let { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            throw new ApiError(400, "All fields are required");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ApiError(400, "Invalid email format");
        }

        if (password.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters long");
        }

        username = username.toLowerCase().trim();
        email = email.toLowerCase().trim();

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            if (existingUser.email === email) {
                throw new ApiError(409, "Email already exists");
            }
            throw new ApiError(409, "Username already exists");
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                username,
                email,
                password: hashedPassword,
            },
        });

        await invalidateActiveTokens(user.id, "VERIFY_EMAIL");
        const verifyToken = await createAuthToken(user.id, "VERIFY_EMAIL", 60);
        await sendVerificationEmail(user, verifyToken);

        const response = {
            success: true,
            message: "User registered successfully. Please verify your email.",
        };

        if (!isProd) {
            response.verifyToken = verifyToken;
        }

        return res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};


const login = async (req, res, next) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }

        email = email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new ApiError(401, "Invalid credentials");
        }

        if (!user.password) {
            throw new ApiError(401, "Use Google login for this account");
        }

        const isValid = await comparePassword(password, user.password);

        if (!isValid) {
            throw new ApiError(401, "Invalid credentials");
        }

        if (!user.emailVerifiedAt) {
            throw new ApiError(403, "Please verify your email before logging in");
        }

        const payload = { id: user.id, role: user.role };

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

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
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
                emailVerifiedAt: true,
            },
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.json({
            ...user,
            emailVerified: Boolean(user.emailVerifiedAt),
        });
    } catch (error) {
        next(error);
    }
};


const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            throw new ApiError(401, "Unauthorized");
        }

        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (err) {
            throw new ApiError(401, "Invalid or expired token");
        }

        const payload = {
            id: decoded.id,
            role: decoded.role,
        };

        const newAccessToken = signAccessToken(payload);
        const newRefreshToken = signRefreshToken(payload);

        res.cookie("accessToken", newAccessToken, {
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

        if (!email) {
            throw new ApiError(400, "Email is required");
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (!user) {
            return res.json({ success: true, message: "If the account exists, a verification link has been sent" });
        }

        if (user.emailVerifiedAt) {
            return res.json({ success: true, message: "Email is already verified" });
        }

        await invalidateActiveTokens(user.id, "VERIFY_EMAIL");
        const verifyToken = await createAuthToken(user.id, "VERIFY_EMAIL", 60);
        await sendVerificationEmail(user, verifyToken);

        const response = {
            success: true,
            message: "If the account exists, a verification link has been sent",
        };

        if (!isProd) {
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

        if (!token) {
            throw new ApiError(400, "Verification token is required");
        }

        const tokenHash = hashToken(token);

        const authToken = await prisma.authToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });

        if (!authToken || authToken.type !== "VERIFY_EMAIL" || authToken.usedAt || authToken.expiresAt < new Date()) {
            throw new ApiError(400, "Invalid or expired verification token");
        }

        await prisma.$transaction([
            prisma.user.update({
                where: { id: authToken.userId },
                data: { emailVerifiedAt: new Date() },
            }),
            prisma.authToken.update({
                where: { id: authToken.id },
                data: { usedAt: new Date() },
            }),
        ]);

        return res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            throw new ApiError(400, "Email is required");
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

        if (!user) {
            return res.json({ success: true, message: "If the account exists, a reset link has been sent" });
        }

        if (!user.password) {
            return res.json({ success: true, message: "If the account exists, a reset link has been sent" });
        }

        await invalidateActiveTokens(user.id, "RESET_PASSWORD");
        const resetToken = await createAuthToken(user.id, "RESET_PASSWORD", 30);
        await sendResetPasswordEmail(user, resetToken);

        const response = {
            success: true,
            message: "If the account exists, a reset link has been sent",
        };

        if (!isProd) {
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

        if (!token || !password) {
            throw new ApiError(400, "Token and password are required");
        }

        if (password.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters long");
        }

        const tokenHash = hashToken(token);
        const authToken = await prisma.authToken.findUnique({
            where: { tokenHash },
        });

        if (!authToken || authToken.type !== "RESET_PASSWORD" || authToken.usedAt || authToken.expiresAt < new Date()) {
            throw new ApiError(400, "Invalid or expired reset token");
        }

        const hashedPassword = await hashPassword(password);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: authToken.userId },
                data: { password: hashedPassword },
            }),
            prisma.authToken.update({
                where: { id: authToken.id },
                data: { usedAt: new Date() },
            }),
        ]);

        return res.json({ success: true, message: "Password reset successfully" });
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
};
