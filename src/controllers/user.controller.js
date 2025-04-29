const {
	createUser,
	getAllUsers,
	getUserById,
	getUserByEmail,
	updateUser,
	deleteUser
} = require("../models/users.model");

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } _next
 */
const createNewUser = async (req, res, _next) => {
	try {
		const { fullName, email, gender, phone, password } = req.body;
		if (!fullName || !email || !gender || !phone || !password) {
			return res.status(422).json({
				code: 422,
				message: "Please make sure all fields are filled in.",
				data: null
			});
		}

		const isUserExist = await getUserByEmail(email);
		if (isUserExist) {
			return res.status(400).json({
				code: 400,
				message: "Email already exists.",
				data: null
			});
		}

		if (!["male", "female"].includes(gender)) {
			return res.status(400).json({
				code: 400,
				message: "Unacceptable gender value.",
				data: null
			});
		}

		await createUser({
			fullName,
			email,
			gender,
			phone,
			password
		});

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
 * @param { import("express").Request } _req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } _next
 */
const getUsers = async (_req, res, _next) => {
	try {
		const users = await getAllUsers();

		return res.status(200).json({
			code: 200,
			message: "Success Get All Users!",
			data: users
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
const getOneUser = async (req, res, _next) => {
	const { id } = req.params;

	try {
		const user = await getUserById(id);

		if (!user) {
			return res.status(200).json({
				code: 200,
				message: "User Not Found",
				data: null
			});
		}

		return res.status(200).json({
			code: 200,
			message: "Successfully Get One User!",
			data: user
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
const updateUserData = async (req, res, _next) => {
	try {
		const { id } = req.params;
		const data = req.body;
		const fieldPaths = req.query.field;

		const isUserExist = await getUserById(id);
		if (!isUserExist) {
			return res.status(400).json({
				code: 400,
				message: "User Not Found.",
				data: null
			});
		}

		const dataFields = Object.keys(data);

		if (dataFields.length < 1) {
			return res.status(422).json({
				code: 422,
				message: "No data given.",
				data: null
			});
		}

		if (dataFields.length > 3) {
			return res.status(422).json({
				code: 422,
				message: "Too many fields.",
				data: null
			});
		}

		const isQueryStringMatch = Array.isArray(fieldPaths)
			? fieldPaths.every((field) => dataFields.includes(field)) && fieldPaths.length === dataFields.length
			: fieldPaths === dataFields[0] && dataFields.length === 1;

		if (!isQueryStringMatch) {
			return res.status(422).json({
				code: 422,
				message: "Unmatched query string(s).",
				data: null
			});
		}

		const updatedUserData = await updateUser(id, data);
		res.status(200).json({
			code: 200,
			message: "Successfully Updated User!",
			updatedData: updatedUserData[0]
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
const deleteUserData = async (req, res, _next) => {
	const { id } = req.params;

	try {
		const isUserExist = await getUserById(id);
		if (!isUserExist) {
			return res.status(400).json({
				code: 400,
				message: "User Not Found.",
				data: null
			});
		}

		await deleteUser(id);

		return res.status(200).json({
			code: 200,
			message: "Successfully Delete User!",
			data: null
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			code: 500,
			message: "Internal Server Error"
		});
	}
};
module.exports = { createNewUser, getUsers, getOneUser, updateUserData, deleteUserData };
