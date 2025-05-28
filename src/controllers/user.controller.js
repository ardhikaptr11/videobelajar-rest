const { createUser, getAllUsers, getUserByEmail, updateUser, deleteUser } = require("../models/users.model");

const { accessUserDataByRole, updateUserDataByRole, deleteUserDataByRole } = require("../services/user.service");
const { deleteFromCloudinary } = require("../services/upload.service");
const throwError = require("../services/errorHandling.service");

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const handleGetUsers = async (req, res, next) => {
	try {
		const users = await getAllUsers();

		return res.status(200).json({
			code: 200,
			message: "Success get all users!",
			data: users
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
const handleGetOneUser = async (req, res, next) => {
	try {
		const { id: targetId } = req.params;
		const { role } = req.user;

		const user = await accessUserDataByRole(role, targetId);

		if (!user) throwError("User not found", 404);

		return res.status(200).json({ code: 200, message: "Successfully get one user!", data: user });
	} catch (error) {
		next(error);
	}
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const handleUpdateUserData = async (req, res, next) => {
	try {
		const { role } = req.user;
		const { id: targetId } = req.params;
		const dataToUpdate = { ...req.dataToUpdate };

		const result = await updateUserDataByRole(role, targetId, dataToUpdate);

		return res.status(200).json({
			code: 200,
			message: "Profile updated successfully!",
			data: {
				success: true,
				...result
			}
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
const handleDeleteUserData = async (req, res, next) => {
	try {
		const { id: targetId } = req.params;
		const { role } = req.user;

		const user = await accessUserDataByRole(role, targetId);

		if (!user) throwError("User not found", 404);

		await deleteUserDataByRole(role, targetId);

		return res.status(200).json({ code: 200, message: "User successfully deleted!", data: null });
	} catch (error) {
		next(error);
	}
};

const handleUploadImage = async (req, res, next) => {
	
}

module.exports = { handleGetUsers, handleGetOneUser, handleUpdateUserData, handleDeleteUserData };
