const express = require("express");

const router = express.Router();

const { createNewUser, getUsers, getOneUser } = require("../controllers/user.controller");

router.post("/user", createNewUser);
// Get all users
router.get("/users", getUsers);
// Get one user by ID
router.get("/users/:id", getOneUser);

module.exports = router;
