const prisma = require("../configs/prisma");

const {
    hashPassword,
    comparePassword
} = require("../utils/hash");

const {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
} = require("../utils/jwt");


const register = async (req, res) => {
    let { name, username, email, password } = req.body;

    username = username.toLowerCase().trim();
    email = email.toLowerCase().trim();

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ email }, { username }],
        },
    });

    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
        data: {
            name,
            username,
            email,
            password: hashedPassword,
        },
    });

    return res.status(201).json({
        message: "User registered successfully",
    });
};


const login = async (req, res) => {
    let { email, password } = req.body;

    email = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = {
        id: user.id,
        role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const isProd = process.env.NODE_ENV === "production";

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

    return res.json({ message: "Login successful" });
};


const logout = (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.json({ message: "Logged out successfully" });
};


const me = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
        },
    });

    return res.json(user);
};


const refreshToken = async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = verifyRefreshToken(refreshToken);

        const payload = {
            id: decoded.id,
            role: decoded.role,
        };

        const accessToken = signAccessToken(payload);
        const newRefreshToken = signRefreshToken(payload);

        const isProd = process.env.NODE_ENV === "production";

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

        return res.json({ message: "Refresh token successful" });
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};


module.exports = {
    register,
    login,
    logout,
    me,
    refreshToken,
};
