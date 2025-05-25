const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {Object} options - Delete options
 * @returns {Promise<Object>}
 */
const deleteFromCloudinary = async (publicId, options = {}) => {
	try {
		const deleteOptions = {
			resource_type: options.resource_type || "image",
			...options
		};

		const result = await cloudinary.uploader.destroy(publicId, deleteOptions);

		return {
			success: result === "ok",
			publicId,
			result
		};
	} catch (error) {
		throw new Error(`Error deleting from Cloudinary: ${error.message}`);
	}
};

/**
 * Generate a transformed image URL
 * @param {string} publicId - Public ID of the file
 * @param {Object} options - Transformation options
 * @returns {string} - Transformed URL
 */
const generateTransformedUrl = (publicId, options = {}) => {
	const transformOptions = {
		secure: true,
		...options
	};

	return cloudinary.url(publicId, transformOptions);
};

module.exports = { deleteFromCloudinary, generateTransformedUrl };
