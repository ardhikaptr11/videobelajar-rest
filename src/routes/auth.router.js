const express = require("express");

const { validateLogin, validateRegister, validateVerification } = require("../middleware/validation.middleware");
const { handleRegister, handleLogin, handleEmailVerification } = require("../controllers/auth.controller");

const router = express.Router();

// Register new user
router.post("/register", validateRegister, handleRegister);
// Login existing user
router.post("/login", validateLogin, handleLogin);
// Verify user
router.get("/verify-email", validateVerification, handleEmailVerification);

module.exports = router;
