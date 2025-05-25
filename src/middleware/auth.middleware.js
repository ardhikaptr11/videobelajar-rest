const jwt = require("jsonwebtoken");
const path = require("path");

const knex = require("../models/knex");
const throwError = require("../services/errorHandling.service");

require("@dotenvx/dotenvx").config({
	path: path.join(
		__dirname,
		"../..",
		`${process.env.NODE_ENV === "development" ? ".env" : `.env.${process.env.NODE_ENV}`}`
	)
});

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const authenticate = async (req, res, next) => {
	try {
		const authHeader = req.get("Authorization");

		if (!authHeader || authHeader.split(" ").length !== 2)
			throwError("Authentication failed. Invalid or missing token", 401);

		const token = authHeader.split(" ")[1];

		const decoded = jwt.verify(token, process.env.JWT_SECRET, { issuer: "videobelajar-api" });
		req.user = decoded;

		next();
	} catch (error) {
		if (error.name === "JsonWebTokenError") throwError(error.message, 401);

		return next(error);
	}
};

module.exports = authenticate;
