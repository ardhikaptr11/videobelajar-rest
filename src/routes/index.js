const express = require("express");

const router = express.Router();

const routes = [require("./user.router"), require("./course.router")];

routes.forEach((route) => {
	router.use("/api/v1", route);
});

module.exports = router;
