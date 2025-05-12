const jwt = require("jsonwebtoken");
const path = require("path");

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
const verifyToken = async (req, res, next) => {
	try {
		const authHeader = req.get("authorization");

		if (authHeader.split(" ").length !== 2) {
			return res.status(401).json({
				code: 401,
				message: "Invalid token",
				data: null
			});
		}

		const token = authHeader.split(" ")[1];

		if (!token) return res.status(401).json({ code: 401, message: "Authentication failed, no token provided" });

		const decoded = jwt.verify(token, process.env.JWT_SECRET, { issuer: "videobelajar-api" });
		req.user = decoded;

		next();
	} catch (error) {
		if (error.message === "JsonWebTokenError") {
			return res.status(401).json({
				code: 401,
				message: error.message,
				data: null
			});
		}
	}
};

module.exports = verifyToken;