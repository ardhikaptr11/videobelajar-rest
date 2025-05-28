const bcrypt = require("bcryptjs");

const { accessUserDataByRole } = require("../services/user.service");
const { getUserByEmail, getUserByVerifToken } = require("../models/users.model");
const { getCourseById, getCourseByName } = require("../models/courses.model");
const throwError = require("../services/errorHandling.service");

const emailPattern = /^[a-zA-Z][a-zA-Z0-9-_.]*@(?:gmail\.com|(?!gmail\.)[a-z]+\.(?:com|co\.[a-z]{2,3}))$/;

/**
 *
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const validateRegister = async (req, res, next) => {
	try {
		const { full_name, email, gender, phone, password } = req.body;
		const isPayloadEmpty = Object.keys(req.body).length === 0;

		if (!full_name || !email || !gender || !phone || !password || isPayloadEmpty)
			throwError("Please make sure all fields are filled in", 400);

		const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
		const phonePattern = /^8[1-9][0-9]{8,11}$/;

		if (email.includes("admin")) throwError("Unable to use reserved email", 400);

		const isEmailAllowed = emailPattern.test(email);
		if (!isEmailAllowed) throwError("Invalid email", 400);

		const isPhoneAllowed = phonePattern.test(phone);
		if (!isPhoneAllowed) throwError("Invalid phone number", 400);

		const isPasswordAllowed = passwordPattern.test(password);
		if (!isPasswordAllowed) throwError("Password is too weak", 400);

		const isUserExist = await getUserByEmail(email);

		if (!["male", "female"].includes(gender)) throwError("Unacceptable gender value", 400);

		if (isUserExist) throwError("Email already registered", 409);

		next();
	} catch (error) {
		next(error);
	}
};

/**
 *
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const validateLogin = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		const isPayloadEmpty = Object.keys(req.body).length === 0;

		if (!email || !password || isPayloadEmpty) throwError("Please make sure all fields are filled in", 400);

		const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
		const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

		if (
			(email === ADMIN_EMAIL && password !== ADMIN_PASSWORD) ||
			(email !== ADMIN_EMAIL && password === ADMIN_PASSWORD)
		)
			throwError("Invalid admin credentials", 401);

		if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) return next();

		const isEmailValid = email && emailPattern.test(email);

		const user = isEmailValid ? await getUserByEmail(email) : null;
		if (!user) throwError("User not found", 404);

		const isPasswordMatch = user && (await bcrypt.compare(password, user.password));

		if (!isEmailValid || !user || !isPasswordMatch) throwError("Invalid email or password", 401);

		if (!user.is_verified) throwError("Cannot login, please verify your account first", 403);

		next();
	} catch (error) {
		next(error);
	}
};

/**
 *
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const validateVerification = async (req, res, next) => {
	try {
		const verificationToken = req.query.token;

		if (!verificationToken) throwError("Verification token is required", 400);

		const user = await getUserByVerifToken(verificationToken);

		if (!user) throwError("Token not recognized", 400);

		if (user.is_verified) throwError("User already verified", 409);

		req.params.id = user.user_id;

		next();
	} catch (error) {
		next(error);
	}
};

/**
 *
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const validateRoleAccess = async (req, res, next) => {
	try {
		const { id: targetId } = req.params;
		const { userId, role } = req.user;

		const reqMethod = req.method;
		const urlPath = req.path;

		// Allow admin to access any resource
		if (role === "admin") return next();

		if (urlPath.includes("/upload")) return next();

		if (role === "user") {
			if (reqMethod !== "GET" && (urlPath.includes("course") || userId !== targetId))
				throwError("You are not allowed to perform this action", 403);

			if (userId !== targetId && reqMethod === "GET" && !urlPath.includes("course"))
				throwError("You are not allowed to access this resource", 403);
		}

		next();
	} catch (error) {
		next(error);
	}
};

/**
 *
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const validateDataBeforeProceed = async (req, res, next) => {
	try {
		const reqMethod = req.method;
		const data = req.body || {};

		const {
			name,
			tagline,
			description,
			price,
			is_discount,
			discounted_price,
			thumbnail_img_url,
			categories,
			modules
		} = data;

		const pattern = /^[1-9]\d*$/;

		if (!["GET", "DELETE"].includes(reqMethod) && Object.keys(data).length === 0)
			throwError("Cannot proceed with empty data", 400);

		if (reqMethod === "PATCH" || reqMethod === "GET" || reqMethod === "DELETE") {
			const id = +req.params.id;

			if (!pattern.test(id)) throwError("Course ID must be a positive integer number", 400);
		}

		if (is_discount && !discounted_price) throwError("Please specify the discounted price", 400);

		const isInvalidPrice = price < 0 || price % 1 !== 0 || !pattern.test(price);
		const isInvalidDiscountedPrice =
			is_discount && (discounted_price < 0 || discounted_price % 1 !== 0 || !pattern.test(discounted_price));

		if (price && (isInvalidPrice || isInvalidDiscountedPrice)) throwError("Invalid price value", 400);

		if (!is_discount && discounted_price && discounted_price > 0)
			throwError("Discounted price is not applicable", 400);

		if (is_discount && discounted_price >= price)
			throwError("Discounted price cannot be equal or exceed the original price", 422);

		if (reqMethod === "POST") {
			if (!name || !tagline || !description || !price || !thumbnail_img_url || !categories || !modules)
				throwError("Please make sure all fields are filled in", 400);

			const isNameTaken = await getCourseByName(name);

			if (isNameTaken) throwError("Course name already taken", 409);
		}

		if (reqMethod === "PATCH") {
			const payload = req.body;
			const { mode } = req.query;

			if (is_discount && !discounted_price) throwError("Please specify the discounted price", 400);

			if (!mode || mode === "default") {
				if (!categories || categories.length === 0)
					throwError("Failed to overwrite. No category provided", 400);
			}

			if (mode && !["default", "strict"].includes(mode))
				throwError("Unknown mode. Mode must be either 'default' or 'strict'", 400);

			if (mode === "strict") {
				if (!categories || categories.length === 0) throwError("Failed to append. No category provided", 400);
			}
		}

		next();
	} catch (error) {
		next(error);
	}
};

/**
 *
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const validateUserDataBeforeUpdate = async (req, res, next) => {
	try {
		const { role } = req.user;
		const { id: targetId } = req.params;
		const dataToUpdate = { ...req.body };
		const uploadedImage = req.file;

		if (Object.keys(dataToUpdate).length === 0) throwError("Cannot proceed with empty data", 400);

		const user = await accessUserDataByRole(role, targetId);
		if (!user) throwError("User not found", 404);

		const isEmailAlreadyUsed = dataToUpdate.email && (await getUserByEmail(dataToUpdate.email));
		if (isEmailAlreadyUsed) throwError("Email is already in use", 409);

		if (uploadedImage && user.avatar_url.includes("res.cloudinary.com")) {
			const publicId = user.avatar_url.split("/").pop().split(".")[0];
			await deleteFromCloudinary(publicId);
		}

		dataToUpdate.avatar_url = uploadedImage.path;

		req.dataToUpdate = dataToUpdate;

		next();
	} catch (error) {
		next(error);
	}
};

module.exports = {
	validateLogin,
	validateRegister,
	validateVerification,
	validateRoleAccess,
	validateDataBeforeProceed,
	validateUserDataBeforeUpdate
};
