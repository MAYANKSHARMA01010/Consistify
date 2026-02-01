const prisma = require("../configs/prisma").prisma;
const ApiError = require("../utils/ApiError");

const {
    hashPassword,
    comparePassword
} = require("../utils/hash");

const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} = require("../utils/jwt");


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

        await prisma.user.create({
            data: {
                name,
                username,
                email,
                password: hashedPassword,
            },
        });

        return res.status(201).json({ success: true, message: "User registered successfully" });
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

        const isValid = await comparePassword(password, user.password);

        if (!isValid) {
            throw new ApiError(401, "Invalid credentials");
        }

        const payload = { id: user.id, role: user.role };

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
            },
        });

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.json(user);
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

        const isProd = process.env.NODE_ENV === "production";

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

module.exports = {
    register,
    login,
    logout,
    me,
    refreshToken,
};
