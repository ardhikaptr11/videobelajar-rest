const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/auth.middleware")

const {
	handleCreateNewUser,
	handleGetUsers,
	handleGetOneUser,
	handleUpdateUserData,
	handleDeleteUserData
} = require("../controllers/user.controller");

// Create new user
router.post("/user", handleCreateNewUser);
// Get all users
router.get("/users", verifyToken, handleGetUsers);
// Get one user by ID
router.get("/user/:id", handleGetOneUser);
// Update user
router.patch("/user/:id", handleUpdateUserData);
// Delete user
router.delete("/user/:id", handleDeleteUserData);

module.exports = router;
