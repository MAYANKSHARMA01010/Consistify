const prisma = require("../configs/prisma");
const ApiError = require("../utils/ApiError");
const { sendEmail } = require("../utils/mailer");
const { generateToken, hashToken } = require("../utils/authToken");
const { hashPassword, comparePassword } = require("../utils/hash");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { env } = require("../configs/env");

const isProd = env.NODE_ENV === "production";

const getFrontendBaseUrl = () => {
    return isProd ? env.FRONTEND_SERVER_URL : env.FRONTEND_LOCAL_URL;
};

const createAuthToken = async (userId, type, ttlMinutes) => {
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await prisma.authToken.create({
        data: { userId, tokenHash, type, expiresAt },
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
        data: { usedAt: new Date() },
    });
};

const sendVerificationEmail = async (user, rawToken) => {
    const baseUrl = getFrontendBaseUrl();
    if (!baseUrl) return;
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
    if (!baseUrl) return;
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;
    await sendEmail({
        to: user.email,
        subject: "Reset your Consistify password",
        text: `Reset your password using this link: ${resetUrl}`,
        html: `<p>Reset your password by clicking <a href="${resetUrl}">this link</a>.</p>`,
    });
};

const registerUser = async (data) => {
    let { name, username, email, password } = data;
    username = username.toLowerCase().trim();
    email = email.toLowerCase().trim();

    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
        if (existingUser.email === email) throw new ApiError(409, "Email already exists");
        throw new ApiError(409, "Username already exists");
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
        data: { name, username, email, password: hashedPassword },
    });

    await invalidateActiveTokens(user.id, "VERIFY_EMAIL");
    const verifyToken = await createAuthToken(user.id, "VERIFY_EMAIL", 60);
    await sendVerificationEmail(user, verifyToken);

    return { user, verifyToken };
};

const loginUser = async (email, password) => {
    email = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new ApiError(401, "Invalid credentials");
    if (!user.password) throw new ApiError(401, "Use Google login for this account");

    const isValid = await comparePassword(password, user.password);
    if (!isValid) throw new ApiError(401, "Invalid credentials");
    if (!user.emailVerifiedAt) throw new ApiError(403, "Please verify your email before logging in");

    const payload = { id: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return { accessToken, refreshToken, isProd };
};

const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true, name: true, username: true, email: true, role: true,
            emailVerifiedAt: true, verificationBannerDismissed: true,
        },
    });

    if (!user) throw new ApiError(404, "User not found");
    return {
        ...user,
        emailVerified: Boolean(user.emailVerifiedAt),
        verificationBannerDismissed: user.verificationBannerDismissed,
    };
};

const refreshAuthToken = (refreshTokenStr) => {
    if (!refreshTokenStr) throw new ApiError(401, "Unauthorized");

    let decoded;
    try {
        decoded = verifyRefreshToken(refreshTokenStr);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired token");
    }

    const payload = { id: decoded.id, role: decoded.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return { accessToken, refreshToken, isProd };
};

const requestEmailVerification = async (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || user.emailVerifiedAt) return null;

    await invalidateActiveTokens(user.id, "VERIFY_EMAIL");
    const verifyToken = await createAuthToken(user.id, "VERIFY_EMAIL", 60);
    await sendVerificationEmail(user, verifyToken);

    return verifyToken;
};

const verifyEmail = async (token) => {
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
};

const forgotPassword = async (email) => {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || !user.password) return null;

    await invalidateActiveTokens(user.id, "RESET_PASSWORD");
    const resetToken = await createAuthToken(user.id, "RESET_PASSWORD", 30);
    await sendResetPasswordEmail(user, resetToken);

    return resetToken;
};

const resetPassword = async (token, password) => {
    const tokenHash = hashToken(token);
    const authToken = await prisma.authToken.findUnique({ where: { tokenHash } });

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
};

const dismissBanner = async (userId) => {
    await prisma.user.update({
        where: { id: userId },
        data: { verificationBannerDismissed: true },
    });
};

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    refreshAuthToken,
    requestEmailVerification,
    verifyEmail,
    forgotPassword,
    resetPassword,
    dismissBanner,
    isProd
};
