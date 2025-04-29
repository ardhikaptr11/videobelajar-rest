const express = require("express");

const router = express.Router();

const { createNewUser, getUsers, getOneUser, updateUserData, deleteUserData } = require("../controllers/user.controller");

// Create new user
router.post("/user", createNewUser);
// Get all users
router.get("/users", getUsers);
// Get one user by ID
router.get("/user/:id", getOneUser);
// Update user
router.patch("/user/update/:id", updateUserData);
// Delete user
router.delete("/user/:id", deleteUserData);

module.exports = router;
