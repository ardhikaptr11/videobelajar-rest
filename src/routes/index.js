const express = require("express");

const router = express.Router();

const routes = [require("./user.router"), require("./course.router"), require("./auth.router")];

routes.forEach((route) => {
	router.use("/api/v2", route);
});

module.exports = router;