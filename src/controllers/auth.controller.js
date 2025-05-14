const jwt = require("jsonwebtoken");
const path = require("path");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

const createTransport = require("../services/email.service");

const envFile = process.env.NODE_ENV === "development" ? ".env" : `.env.${process.env.NODE_ENV}`;

require("@dotenvx/dotenvx").config({ path: path.join(__dirname, "../..", envFile) });

const { createUser, updateUser } = require("../models/users.model");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const uuid = uuidv4();
const token = uuid.split("-").slice(1, 3).join("");

const generateToken = (user) => {
	const payload = { ...user, role: `${user.email === "admin@videobelajar.com" ? "admin" : "user"}` };

	const config =
		user.email === "admin@videobelajar.com"
			? {
					issuer: "videobelajar-api",
					subject: user.email
			  }
			: {
					expiresIn: 5 * 60 * 60,
					issuer: "videobelajar-api",
					subject: user.email
			  };

	const token = jwt.sign(payload, JWT_SECRET, config);
	return token;
};

const generateMessage = (email) => {
	const message =
		process.env.NODE_ENV === "development"
			? {
					from: "Videobelajar app <no-reply@videobelajar.com>",
					to: `${email}`,
					subject: "Hello from tests ✔",
					html: `<p>Follow this <a href="http://localhost:8765/api/v2/verify-email?token=${token}">link</a> to complete verification</p>`
			  }
			: {
					from: "Videbelajar <videobelajar@yopmail.com>",
					to: `${email}`,
					subject: "Email Verification",
					text: `Your email verification token: ${token}`
			  };

	return message;
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } _next
 */
const handleRegister = async (req, res, _next) => {
	try {
		const { full_name, email, gender, phone, password } = req.body;

		const transporter = createTransport();
		const messageToSend = generateMessage(email);

		await createUser({
			full_name,
			email,
			gender,
			phone,
			password,
			verif_token: token
		});

		await transporter.sendMail(messageToSend);

		return res.status(201).json({
			code: 201,
			message: "Successfully Created New User!"
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			code: 500,
			message: "Failed to register user",
			data: null
		});
	}
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } _next
 */
const handleLogin = async (req, res, _next) => {
	try {
		const { email } = req.body;

		const token = generateToken({ email });

		return res.status(200).json({
			code: 200,
			message: "Login success!",
			data: { token, lastLogin: new Date().toISOString() }
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			code: 500,
			message: "Failed to login user",
			data: null
		});
	}
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } _next
 */
const handleEmailVerification = async (req, res, _next) => {
	try {
		const { id } = req.params;
		const data = await updateUser(id, { is_verified: true });

		return res.status(200).json({
			code: 200,
			message: "Verification success!",
			data
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			code: 500,
			message: "Failed to verify user",
			data: null
		});
	}
};

module.exports = { handleRegister, handleLogin, handleEmailVerification };
