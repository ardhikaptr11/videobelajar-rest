const express = require("express");

const { handleRegister, handleLogin } = require("../controllers/auth.controller");

const router = express.Router();

// Register new user
router.post("/register", handleRegister);
// Login existing user
router.post("/login", handleLogin)


module.exports = router;