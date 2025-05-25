const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const uploadSingleImage = require("../middleware/upload.middleware");
const { validateRoleAccess, validateUserDataBeforeUpdate } = require("../middleware/validation.middleware");
const { checkUploadError } = require("../middleware/error.middleware");

const {
	handleCreateNewUser,
	handleGetUsers,
	handleGetOneUser,
	handleUpdateUserData,
	handleDeleteUserData
} = require("../controllers/user.controller");

// Get all users
router.get("/users", authenticate, validateRoleAccess, handleGetUsers);
// Get one user by ID
router.get("/user/:id", authenticate, validateRoleAccess, handleGetOneUser);
// Update user
router.patch(
	"/user/:id",
	authenticate,
	validateRoleAccess,
	uploadSingleImage("avatar_img"),
	checkUploadError,
	validateUserDataBeforeUpdate,
	handleUpdateUserData
);

// Delete user
router.delete("/user/:id", authenticate, validateRoleAccess, handleDeleteUserData);

// Upload image
router.post("/upload", uploadSingleImage("avatar_img"), checkUploadError, (req, res) => {
	const { file } = req;

	if (!file) {
		return res.status(400).json({ code: 400, message: "No file uploaded", data: null });
	}

	return res.status(200).json({
		code: 200,
		message: "File uploaded successfully",
		data: { url: file.path }
	});
});

module.exports = router;
