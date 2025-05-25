const express = require("express");

const { validateLogin, validateRegister, validateVerification } = require("../middleware/validation.middleware");
const { handleRegister, handleLogin, handleEmailVerification } = require("../controllers/auth.controller");

const router = express.Router();

// Register new user
router.post("/auth/register", validateRegister, handleRegister);
// Login existing user
router.post("/auth/login", validateLogin, handleLogin);
// Verify user
router.get("/auth/verify-email", validateVerification, handleEmailVerification);

module.exports = router;
