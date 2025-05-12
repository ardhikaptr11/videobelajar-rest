const jwt = require("jsonwebtoken");
const path = require("path");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { v7: uuidv7 } = require("uuid");

const createTransport = require("../services/email.service");

const envFile = process.env.NODE_ENV === "development" ? ".env" : `.env.${process.env.NODE_ENV}`;

require("@dotenvx/dotenvx").config({ path: path.join(__dirname, "../..", envFile) });

const { createUser, getUserByEmail } = require("../models/users.model");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const generateToken = (user) => {
	const config = {
		expiresIn: 5 * 60 * 60,
		issuer: "videobelajar-api",
		subject: user.email
	};

	const token = jwt.sign(user, JWT_SECRET, config);
	return token;
};

const generateMessage = (email) => {
	const token = uuidv7();

	const message =
		process.env.NODE_ENV === "development"
			? {
					from: "Example app <no-reply@example.com>",
					to: `${email}`,
					subject: "Hello from tests ✔",
					text: `Your email verification token: ${token}`
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

		if (!full_name || !email || !gender || !phone || !password) {
			return res.status(422).json({
				code: 422,
				message: "Please make sure all fields are filled in",
				data: null
			});
		}

		const isUserExist = await getUserByEmail(email);
		if (isUserExist) {
			return res.status(400).json({
				code: 400,
				message: "Email already exists",
				data: null
			});
		}

		if (!["male", "female"].includes(gender)) {
			return res.status(400).json({
				code: 400,
				message: "Unacceptable gender value",
				data: null
			});
		}

		const transporter = createTransport();

		const messageToSend = generateMessage(email);
		const info = await transporter.sendMail(messageToSend);

		console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

		// await createUser({
		// 	full_name,
		// 	email,
		// 	gender,
		// 	phone,
		// 	password
		// });

		return res.status(201).json({
			code: 201,
			message: "Successfully Created New User!"
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			code: 500,
			message: "Internal Server Error"
		});
	}
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } _next
 */
const handleLogin = async (req, res, _next) => {
	const { email, password } = req.body;

	if (!email || !password || Object.keys(req.body).length === 0) {
		return res.status(400).json({
			code: 400,
			message: "Please make sure all fields are filled in"
		});
	}

	const user = await getUserByEmail(email);
	if (!user) {
		return res.status(200).json({
			code: 200,
			message: "User not found",
			data: null
		});
	}

	const isPasswordMatch = await bcrypt.compare(password, user.password);
	if (!isPasswordMatch) {
		return res.status(400).json({
			code: 400,
			message: "Invalid password"
		});
	}

	const token = generateToken({ email });

	return res.status(200).send({
		code: 200,
		message: "Login success!",
		token,
		lastLogin: new Date().toISOString()
	});
};

module.exports = { handleRegister, handleLogin };
