
const Admin = require("../models/Admin");
const Manager = require("../models/Manager");
const Staff = require("../models/Staff");
const Otp = require("../models/OTP");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require("../utils/generateToken");
const { createAndSendOTP, verifyOTP: verifyOTPUtil } = require("../utils/sendOTP");

// ================== Admin Register ==================
const registerAdmin = async (req, res, next) => {
    try {
        const { companyName, name, email, phone, password } = req.body;

        // Check if already exists
        const exists = await Admin.findOne({ $or: [{ email }, { phone }] }).select('_id').lean();
        if (exists) {
            return res.status(400).json({ success: false, message: "Email or phone already registered" });
        }

        const hashedPassword = await hashPassword(password);

        const admin = await Admin.create({
            companyName,
            name,
            email,
            phone,
            password: hashedPassword,
        });

        return res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            data: { id: admin._id, companyName: admin.companyName, email: admin.email },
        });
    } catch (err) {
        next(err);
    }
};

// ================== Login (Admin/Manager) ==================
const login = async (req, res, next) => {
    try {
        const { email, password, username, pin } = req.body;

        // Admin login with email/password
        if (email && password) {
            const admin = await Admin.findOne({ email }).select('_id password').lean();
            if (!admin) return res.status(404).json({ success: false, message: "Admin not found" });

            const isMatch = await comparePassword(password, admin.password);
            if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

            const accessToken = createAccessToken({ id: admin._id, role: "admin" });
            const refreshToken = createRefreshToken({ id: admin._id, role: "admin" });

            // Do not persist refresh tokens to DB to keep login fast and stateless
            return res.json({ success: true, accessToken, refreshToken });
        }

        // Manager login with username/pin
        if (username && pin) {
            // Try manager login first
            const manager = await Manager.findOne({ username, pin })
                .select('_id business')
                .populate({ path: 'business', select: 'name', options: { lean: true } })
                .lean();
            if (manager) {
                const accessToken = createAccessToken({ id: manager._id, role: "manager" });
                const refreshToken = createRefreshToken({ id: manager._id, role: "manager" });

                return res.json({
                    success: true,
                    accessToken,
                    refreshToken,
                    business: manager.business ? manager.business.name : null,
                });
            }

            // Try staff login if manager not found
            const staff = await Staff.findOne({ username, pin })
                .select('_id business manager')
                .populate([{ path: 'business', select: 'name', options: { lean: true } }, { path: 'manager', select: 'name', options: { lean: true } }])
                .lean();
            if (staff) {
                const accessToken = createAccessToken({ id: staff._id, role: "staff" });
                const refreshToken = createRefreshToken({ id: staff._id, role: "staff" });

                return res.json({
                    success: true,
                    accessToken,
                    refreshToken,
                    business: staff.business ? staff.business.name : null,
                    manager: staff.manager ? staff.manager.name : null,
                });
            }

            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(400).json({ success: false, message: "Invalid login credentials" });
    } catch (err) {
        next(err);
    }
};




// ================== Manager Login (PIN-based) ==================
const loginManager = async (req, res, next) => {
    try {
        const { username, pin } = req.body;

        const manager = await Manager.findOne({ username, pin }).populate("business");
        if (!manager) return res.status(404).json({ success: false, message: "Manager not found" });

        const accessToken = createAccessToken({ id: manager._id, role: "manager" });
        const refreshToken = createRefreshToken({ id: manager._id, role: "manager" });

        return res.json({
            success: true,
            accessToken,
            refreshToken,
            business: manager.business ? manager.business.name : null,
        });
    } catch (err) {
        next(err);
    }
};

// ================== Send OTP ==================
const sendOTP = async (req, res, next) => {
    try {
        const { phone, email } = req.body;

        if (!phone && !email) {
            return res.status(400).json({ success: false, message: "Phone or email required" });
        }

        const mode = phone ? 'sms' : 'email';
        const to = phone || email;

        const { otp, expiresAt, otpHash } = await createAndSendOTP({ mode, to });

        await Otp.create({
            phone: phone || null,
            email: email || null,
            otp: otpHash, // Store hashed OTP
            expiresAt: new Date(expiresAt),
        });

        return res.json({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        next(err);
    }
};

// ================== OTP Verify ==================
const verifyOTP = async (req, res, next) => {
    try {
        const { phone, email, otp } = req.body;

        if (!otp || (!phone && !email)) {
            return res.status(400).json({ success: false, message: "OTP and phone/email required" });
        }

        const otpRecord = await Otp.findOne({
            $or: [{ phone }, { email }],
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "OTP not found or expired" });
        }

        const isValid = verifyOTPUtil(otp, otpRecord.otp, otpRecord.expiresAt);

        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // Delete used OTP
        await Otp.findByIdAndDelete(otpRecord._id);

        return res.json({ success: true, message: "OTP verified successfully" });
    } catch (err) {
        next(err);
    }
};

// ================== Refresh Token ==================
const refreshToken = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(401).json({ success: false, message: "No refresh token provided" });

        const decoded = verifyRefreshToken(token);
        if (!decoded) return res.status(401).json({ success: false, message: "Invalid refresh token" });

        const { id, role } = decoded;
        const accessToken = createAccessToken({ id, role });
        const newRefreshToken = createRefreshToken({ id, role });

        if (role === "admin") {
            await Admin.findByIdAndUpdate(id, { refreshToken: newRefreshToken });
        }

        return res.json({ success: true, accessToken, refreshToken: newRefreshToken });
    } catch (err) {
        next(err);
    }
};

// ================== Logout ==================
const logout = async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(401).json({ success: false, message: "Refresh token required" });
        }

        const decoded = verifyRefreshToken(token);
        if (!decoded) {
            return res.status(401).json({ success: false, message: "Invalid refresh token" });
        }

        const { id, role } = decoded;

        if (role === "admin") {
            await Admin.findByIdAndUpdate(id, { refreshToken: null });
        }

        return res.json({ success: true, message: "Logged out successfully" });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    registerAdmin,
    login,
    loginManager,
    sendOTP,
    verifyOTP,
    refreshToken,
    logout,
}
