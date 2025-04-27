const { create: createUser, getAll: getAllUsers, getUserById, getUserByEmail } = require("../models/users");

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

module.exports = { createNewUser, getUsers, getOneUser };
