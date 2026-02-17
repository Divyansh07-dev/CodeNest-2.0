const redisClient = require("../config/redis");
const User = require("../models/user");
const validate = require('../utils/validator');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const Submission = require("../models/submission");

// Helper function for consistent login/auth errors
const sendAuthError = (res) => {
    res.status(401).json({
        success: false,
        message: "Invalid credentials or authentication failed."
    });
};

//----------------------------------------------------------------------
// 1. REGISTER
//----------------------------------------------------------------------
const register = async (req, res) => {
    try {
        console.log(`Attempting registration for email: ${req.body.emailId}`);

        // Validate the input
        validate(req.body);

        const { firstName, emailId, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userData = {
            firstName,
            emailId,
            password: hashedPassword,
            role: 'user',
        };

        const user = await User.create(userData);

        // Ensure JWT_KEY exists
        if (!process.env.JWT_KEY) {
            console.error("FATAL ERROR: JWT_KEY not defined!");
            return res.status(500).json({ success: false, message: "Server configuration error: JWT key missing." });
        }

        // Create JWT
        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        // Set cookie
        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });

        // Response
        res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                role: user.role,
                _id: user._id
            },
            token
        });

    } catch (err) {
        console.error("Registration failed:", err);
        res.status(400).json({
            success: false,
            message: err.message || "Unknown error occurred"
        });
    }
};

//----------------------------------------------------------------------
// 2. LOGIN
//----------------------------------------------------------------------
const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) return sendAuthError(res);

        const user = await User.findOne({ emailId });
        if (!user) return sendAuthError(res);

        const match = await bcrypt.compare(password, user.password);
        if (!match) return sendAuthError(res);

        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                _id: user._id,
                role: user.role
            },
            token
        });

    } catch (err) {
        console.error("Login error:", err);
        sendAuthError(res);
    }
};

//----------------------------------------------------------------------
// 3. LOGOUT
//----------------------------------------------------------------------
const logout = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (token && redisClient) {
            const payload = jwt.decode(token);
            await redisClient.set(`token:${token}`, 'Blocked', 'EXAT', payload.exp);
        }

        res.cookie("token", '', {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

//----------------------------------------------------------------------
// 4. ADMIN REGISTER
//----------------------------------------------------------------------
const adminRegister = async (req, res) => {
    try {
        validate(req.body);
        const { firstName, emailId, password } = req.body;

        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            firstName,
            emailId,
            password: hashedPassword,
            role: 'admin',
        };

        const user = await User.create(userData);

        if (!process.env.JWT_KEY) {
            console.error("JWT_KEY missing!");
            return res.status(500).json({ success: false, message: "Server configuration error" });
        }

        const token = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                role: user.role
            },
            token
        });

    } catch (err) {
        console.error("Admin registration failed:", err);
        res.status(400).json({
            success: false,
            message: err.message || "Unknown error"
        });
    }
};

//----------------------------------------------------------------------
// 5. DELETE PROFILE
//----------------------------------------------------------------------
const deleteProfile = async (req, res) => {
    try {
        const userId = req.result._id;

        const userDeleted = await User.findByIdAndDelete(userId);
        if (!userDeleted) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (Submission) {
            await Submission.deleteMany({ userId });
        }

        res.cookie("token", '', { 
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.status(200).json({ success: true, message: "Deleted successfully" });

    } catch (err) {
        console.error("Delete profile error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = { register, login, logout, adminRegister, deleteProfile };
