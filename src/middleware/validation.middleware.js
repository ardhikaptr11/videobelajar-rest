const bcrypt = require("bcryptjs");

const { getUserByEmail } = require("../models/users.model");

const emailPattern = /^[a-zA-Z][a-zA-Z0-9-_.]*@(?:gmail\.com|(?!gmail\.)[a-z]+\.(?:com|co\.[a-z]{2,3}))$/;

/**
 *
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const validateRegister = async (req, res, next) => {
	const { full_name, email, gender, phone, password } = req.body;
	const isPayloadEmpty = Object.keys(req.body).length === 0;

	const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
	const phonePattern = /^08[1-9][0-9]{7,10}$/;

	if (!full_name || !email || !gender || !phone || !password || isPayloadEmpty)
		return res.status(422).json({ code: 422, message: "Please make sure all fields are filled in", data: null });

	if (email.includes("admin"))
		return res.status(200).json({ code: 200, message: "Unable to use reserved email", data: null });

	const isUserExist = await getUserByEmail(email);

	if (isUserExist) return res.status(400).json({ code: 400, message: "Email already registered", data: null });

	if (!["male", "female"].includes(gender))
		return res.status(400).json({ code: 400, message: "Unacceptable gender value", data: null });

	const isEmailAllowed = emailPattern.test(email);
	if (!isEmailAllowed) return res.status(200).json({ code: 200, message: "Invalid email", data: null });

	const isPhoneAllowed = phonePattern.test(phone);
	if (!isPhoneAllowed) return res.status(200).json({ code: 200, message: "Invalid phone number", data: null });

	const isPasswordAllowed = passwordPattern.test(password);
	if (!isPasswordAllowed) return res.status(200).json({ code: 200, message: "Password is too weak", data: null });

	next();
};

/**
 *
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const validateLogin = async (req, res, next) => {
	const { email, password } = req.body;
	const isPayloadEmpty = Object.keys(req.body).length === 0;

	const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
	const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

	if (!email || !password || isPayloadEmpty)
		return res.status(400).json({ code: 400, message: "Please make sure all fields are filled in", data: null });

	if (
		(email === ADMIN_EMAIL && password !== ADMIN_PASSWORD) ||
		(email !== ADMIN_EMAIL && password === ADMIN_PASSWORD)
	)
		return res.status(200).json({ code: 200, message: "Invalid email or password", data: null });

	if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
		next();
		return;
	}

	const isEmailAllowed = emailPattern.test(email);
	if (!isEmailAllowed) return res.status(200).json({ code: 200, message: "Invalid email", data: null });

	const user = await getUserByEmail(email);
	if (!user) return res.status(200).json({ code: 200, message: "User not found", data: null });

	const isPasswordMatch = await bcrypt.compare(password, user.password);
	if (!isPasswordMatch) return res.status(200).json({ code: 200, message: "Invalid password", data: null });

	next();
};

module.exports = { validateLogin, validateRegister };
