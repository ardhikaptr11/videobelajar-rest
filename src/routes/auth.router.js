const express = require("express");

const { validateLogin, validateRegister } = require("../middleware/validation.middleware");
const { handleRegister, handleLogin } = require("../controllers/auth.controller");

const router = express.Router();

// Register new user
router.post("/register", validateRegister, handleRegister);
// Login existing user
router.post("/login", validateLogin, handleLogin);

module.exports = router;