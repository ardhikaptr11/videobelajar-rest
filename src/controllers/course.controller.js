const {
	createCourse,
	getAllCourses,
	getCourseById,
	getCourseByName,
	deleteCourse
} = require("../models/courses.model");

const { createNewCourse, updateCourseData } = require("../services/course.service");

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } _next
 */
const handleCreateNewCourse = async (req, res, _next) => {
	try {
		const { name, tagline, description, price, thumbnail_img_url, categories, modules } = req.body;

		if (!name || !tagline || !description || !price || !thumbnail_img_url || !categories || !modules) {
			return res.status(422).json({
				code: 422,
				message: "Please make sure all fields are filled in",
				data: null
			});
		}

		const isNameTaken = await getCourseByName(name);
		if (!isNameTaken) {
			const course = await createNewCourse({
				name,
				tagline,
				description,
				price,
				thumbnail_img_url,
				categories,
				modules
			});

			res.status(201).json({
				code: 201,
				message: "Course created successfully!",
				data: course
			});
		}

		return res.status(409).json({
			code: 409,
			message: "Course name already taken.",
			data: null
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			code: 500,
			message: "Server encountered an error",
			data: null
		});
	}
};

/**
 * @param { import("express").Request } _req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } _next
 */
const handleGetAllCourses = async (_req, res, _next) => {
	try {
		const courses = await getAllCourses();
		res.status(200).json({
			code: 200,
			message: "Courses successfully retrieved!",
			data: courses.map((course) => ({
				...course,
				modules: {
					total: course.modules.length,
					list: course.modules.map((module) => ({
						module_id: module.module_id,
						title: module.title
					}))
				}
			}))
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			code: 500,
			message: "Server encountered an error",
			data: null
		});
	}
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } _next
 */
const handleGetOneCourse = async (req, res, _next) => {
	try {
		const { id } = req.params;
		if (!id) {
			return res.status(422).json({
				code: 422,
				message: "Missing parameter",
				data: null
			});
		}

		const course = await getCourseById(id);
		if (!course) {
			return res.status(404).json({
				code: 404,
				message: "Course not found",
				data: null
			});
		}

		res.status(200).json({
			code: 200,
			message: "Course successfully retrieved!",
			data: {
				...course,
				modules: {
					total: course.modules.length,
					list: course.modules.map((module) => ({
						module_id: module.module_id,
						title: module.title
					}))
				}
			}
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			code: 500,
			message: "Server encountered an error",
			data: null
		});
	}
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } _next
 */
const handleUpdateCourseData = async (req, res, _next) => {
	try {
		const { id } = req.params;
		const payload = req.body;
		const query = req.query;

		if (Object.keys(payload).length === 0) {
			return res.status(400).json({
				code: 400,
				message: "Cannot proceed with empty data",
				data: null
			});
		}

		if (!query.mode || query.mode === "default") {
			if (!payload.categories || payload.categories.length === 0) {
				return res.status(400).json({
					code: 400,
					message: "Failed to overwrite. No category provided",
					data: null
				});
			}

			const updatedCourseData = await updateCourseData(id, payload);

			if (!updatedCourseData) {
				return res.status(409).json({
					code: 409,
					message:
						"Cannot override predefined categories with the exact same name",
					data: null
				});
			}

			return res.status(200).json({
				code: 200,
				message: "Successfully updated course data!",
				data: updatedCourseData
			});
		}

		if (query.mode === "strict") {
			if (payload.categories && payload.categories.length === 0) {
				return res.status(400).json({
					code: 400,
					message: "Failed to append. No categories provided",
					data: null
				});
			}

			const updatedCourseData = await updateCourseData(id, payload, query.mode);

			if (!updatedCourseData) {
				return res.status(409).json({
					code: 409,
					message: "Course already has the intended category",
					data: null
				});
			}

			return res.status(200).json({
				code: 200,
				message: "Successfully updated course data!",
				data: updatedCourseData
			});
		}

		return res.status(400).json({
			code: 400,
			message: "Unknown mode. Mode must be either 'default' or 'strict'",
			data: null
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			code: 500,
			message: "Server encountered an error",
			data: null
		});
	}
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } _next
 */
const handleDeleteCourseData = async (req, res, _next) => {
	const { id } = req.params;

	try {
		const isCourseExist = await getCourseById(id);
		if (!isCourseExist) {
			return res.status(400).json({
				code: 400,
				message: "Course Not Found",
				data: null
			});
		}

		await deleteCourse(id);

		return res.status(200).json({
			code: 200,
			message: "Course successfully deleted!",
			data: null
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			code: 500,
			message: "Server encountered an error",
			data: null
		});
	}
};

module.exports = {
	handleCreateNewCourse,
	handleGetAllCourses,
	handleGetOneCourse,
	handleUpdateCourseData,
	handleDeleteCourseData
};
