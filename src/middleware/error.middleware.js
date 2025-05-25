const multer = require("multer");

/**
 *
 * @param {Error} err
 * @param {import("express").Request } req
 * @param {import("express").Response } res
 * @param {import("express").NextFunction } next
 * @returns {void}
 */
const globalErrorHandler = (err, req, res, next) => {
	console.error(err);

	const status = err.status || 500;
	const message = err.message || "Internal Server Error";

	return res.status(status).json({ code: status, message, data: null });
};

/**
 *
 * @param {Error} err
 * @param {import("express").Request } req
 * @param {import("express").Response } res
 * @param {import("express").NextFunction } next
 * @returns {void}
 */
const checkUploadError = (err, req, res, next) => {
	if (!err) return next();

	if (err instanceof multer.MulterError) {
		err.status = 400;

		if (err.code === "LIMIT_FILE_SIZE") {
			err.message = "Uploaded file size exceeds 5 MB limit";
			return next(err);
		}

		if (err.code === "LIMIT_UNEXPECTED_FILE") {
			err.message = "Unexpected or missing field";
			return next(err);
		}

		return next(err);
	}

	return next(err);
};

module.exports = { globalErrorHandler, checkUploadError };
