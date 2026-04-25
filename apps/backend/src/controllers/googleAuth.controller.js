const { OAuth2Client } = require("google-auth-library");
const prisma = require("../configs/prisma");
const {
    signAccessToken,
    signRefreshToken,
} = require("../utils/jwt");
const axios = require("axios");
const { env } = require("../configs/env");

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
    try {
        const redirectUrl =
            env.NODE_ENV === "production"
                ? `${env.BACKEND_SERVER_URL}/api/auth/google/callback`
                : `${env.BACKEND_LOCAL_URL}/api/auth/google/callback`;

        const authUrl =
            `https://accounts.google.com/o/oauth2/v2/auth` +
            `?response_type=code` +
            `&client_id=${env.GOOGLE_CLIENT_ID}` +
            `&redirect_uri=${redirectUrl}` +
            `&scope=openid%20email%20profile`;

        return res.redirect(authUrl);
    } catch (error) {
        console.error("🔥 Google Login Error:", error);
        return res.status(500).json({
            success: false,
            message: "Google login failed",
        });
    }
};

const googleCallback = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Authorization code missing",
            });
        }

        const redirectUrl =
            env.NODE_ENV === "production"
                ? `${env.BACKEND_SERVER_URL}/api/auth/google/callback`
                : `${env.BACKEND_LOCAL_URL}/api/auth/google/callback`;

        const tokenRes = await axios.post("https://oauth2.googleapis.com/token", new URLSearchParams({
            code,
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUrl,
            grant_type: "authorization_code",
        }), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });

        const tokenData = tokenRes.data;

        if (!tokenData.id_token) {
            throw new Error("Failed to retrieve ID token from Google");
        }

        const ticket = await client.verifyIdToken({
            idToken: tokenData.id_token,
            audience: env.GOOGLE_CLIENT_ID,
        });

        const googleUser = ticket.getPayload();

        const email = googleUser.email.toLowerCase();
        const name = googleUser.name;

        const baseUsername = email.split("@")[0];
        const username = `${baseUsername}_${Date.now().toString().slice(-5)}`;

        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    username,
                    password: null,
                    emailVerifiedAt: new Date(),
                },
            });
        }

        const jwtPayload = {
            id: user.id,
            role: user.role,
        };

        const accessToken = signAccessToken(jwtPayload);
        const refreshToken = signRefreshToken(jwtPayload);

        const isProd = env.NODE_ENV === "production";

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

        const frontendRedirect = isProd
            ? `${env.FRONTEND_SERVER_URL}/dashboard`
            : `${env.FRONTEND_LOCAL_URL}/dashboard`;

        return res.redirect(frontendRedirect);
    } catch (error) {
        console.error("🔥 Google Callback Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    googleLogin,
    googleCallback,
};
