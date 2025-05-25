const jwt = require("jsonwebtoken");
const path = require("path");
const bcrypt = require("bcryptjs");

const { v4: uuidv4 } = require("uuid");

const { createUser, updateUser, getUserByEmail } = require("../models/users.model");
const { updateUserDataByRole } = require("../services/user.service");

const verifyEmailConfig = require("../utils/mail");
const { sendVerificationEmail } = require("../services/email.service");

const envFile = process.env.NODE_ENV === "development" ? ".env" : `.env.${process.env.NODE_ENV}`;
require("@dotenvx/dotenvx").config({ path: path.join(__dirname, "../..", envFile) });

const generateToken = async (field) => {
	const JWT_SECRET = process.env.JWT_SECRET;

	const user = field.email !== process.env.ADMIN_EMAIL ? await getUserByEmail(field.email) : null;
	const userId = user ? user.user_id : null;

	const payload = user ? { userId, role: "user" } : { ...field, role: "admin" };

	const config =
		field.email !== process.env.ADMIN_EMAIL
			? process.env.NODE_ENV !== "test"
				? { expiresIn: 5 * 60, issuer: "videobelajar-api", subject: userId }
				: { issuer: "videobelajar-api", subject: userId }
			: { issuer: "videobelajar-api", subject: field.email };

	const token = jwt.sign(payload, JWT_SECRET, config);

	return token;
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const handleRegister = async (req, res, next) => {
	try {
		const { full_name, email, gender, phone, password } = req.body;

		const name = gender === "male" ? "Oliver" : "Eliza";
		const queries = `seed=${name}&radius=20&size=250&backgroundColor=b6e3f4&clothing=collarAndSweater&eyes=closed,default,eyeRoll,happy,hearts,side,squint,surprised,wink,winkWacky,xDizzy`;

		const defaultAvatarUrl = `https://api.dicebear.com/9.x/avataaars/png/${queries}`;

		const verif_token = uuidv4().split("-").slice(1, 3).join("");

		const user = await createUser({
			full_name,
			email,
			gender,
			phone: `0${phone}`,
			password,
			verif_token,
			avatar_url: defaultAvatarUrl
		});

		if (process.env.NODE_ENV !== "test") {
			try {
				console.log("Checking email configuration...");
				await verifyEmailConfig();
				await sendVerificationEmail(user, verif_token);
			} catch (error) {
				console.error("❌ Error sending email:", error.message);
			}
		}

		return res.status(201).json({
			code: 201,
			message: "New user successfully created!",
			data: user
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const handleLogin = async (req, res, next) => {
	try {
		const { email } = req.body;

		const token = await generateToken({ email });

		return res.status(200).json({
			code: 200,
			message: "Login success!",
			data: { token, lastLogin: new Date().toISOString() }
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const handleEmailVerification = async (req, res, next) => {
	try {
		const { id: targetId } = req.params;

		const result = await updateUserDataByRole("user", targetId, { is_verified: true });

		return res.status(200).json({
			code: 200,
			message: "Verification success!",
			data: {
				user_id: result.user_id,
				email: result.email,
				is_verified: result.is_verified,
				verified_at: Date.now()
			}
		});
	} catch (error) {
		error.message = "Failed to verify user";
		next(error);
	}
};

module.exports = { handleRegister, handleLogin, handleEmailVerification };
