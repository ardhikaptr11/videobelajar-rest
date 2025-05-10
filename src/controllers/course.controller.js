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
		const {
			name,
			tagline,
			description,
			price,
			is_discount,
			discounted_price,
			thumbnail_img_url,
			categories,
			modules
		} = req.body;

		const pattern = /^[1-9]\d*$/;

		if (Object.keys(req.body).length === 0) {
			return res.status(400).json({
				code: 400,
				message: "Cannot proceed with empty data",
				data: null
			});
		}

		if (!name || !tagline || !description || !price || !thumbnail_img_url || !categories || !modules) {
			return res.status(400).json({
				code: 400,
				message: "Please make sure all fields are filled in",
				data: null
			});
		}

		if (is_discount && !discounted_price) {
			return res.status(400).json({
				code: 400,
				message: "Please specify the discounted price",
				data: null
			});
		}

		if (
			price &&
			(price < 0 ||
				price % 1 !== 0 ||
				!pattern.test(price) ||
				(is_discount &&
					(discounted_price < 0 || discounted_price % 1 !== 0 || !pattern.test(discounted_price))))
		) {
			return res.status(400).json({
				code: 400,
				message: "Invalid price value",
				data: null
			});
		}

		if (!is_discount && discounted_price && discounted_price > 0) {
			return res.status(400).json({
				code: 400,
				message: "Discounted price is not applicable",
				data: null
			});
		}

		if (is_discount && discounted_price >= price) {
			return res.status(422).json({
				code: 422,
				message: "Discounted price cannot be equal or exceed the original price",
				data: null
			});
		}

		const isNameTaken = await getCourseByName(name);
		if (!isNameTaken) {
			const course = await (is_discount
				? createNewCourse({
						name,
						tagline,
						description,
						price,
						is_discount,
						discounted_price,
						thumbnail_img_url,
						categories,
						modules
				  })
				: createNewCourse({
						name,
						tagline,
						description,
						price,
						thumbnail_img_url,
						categories,
						modules
				  }));

			return res.status(201).json({
				code: 201,
				message: "Course created successfully!",
				data: course
			});
		}

		return res.status(409).json({
			code: 409,
			message: "Course name already taken",
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

		if (courses.length === 0) {
			return res.status(200).json({
				code: 200,
				message: "No data recorded yet",
				data: null
			});
		}

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
		const id = +req.params.id; // Convert to number, non-numeric input will become NaN

		// Regular expression to check if the string is a positive integer number,
		// negative integer numbers or 0 will not pass
		const pattern = /^[1-9]\d*$/;

		if (!pattern.test(id)) {
			return res.status(400).json({
				code: 400,
				message: "Course ID must be a positive integer number",
				data: null
			});
		}

		const course = await getCourseById(id);
		if (!course) {
			return res.status(200).json({
				code: 200,
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
		const id = +req.params.id;
		const query = req.query;
		const payload = req.body;

		const pattern = /^[1-9]\d*$/;

		if (Object.keys(payload).length === 0) {
			return res.status(400).json({
				code: 400,
				message: "Cannot proceed with empty data",
				data: null
			});
		}

		if (!pattern.test(id)) {
			return res.status(400).json({
				code: 400,
				message: "Course ID must be a positive integer number",
				data: null
			});
		}

		const isCourseExist = await getCourseById(id);
		if (!isCourseExist) {
			return res.status(200).json({
				code: 200,
				message: "Course not found",
				data: null
			});
		}

		if (
			payload.price &&
			(payload.price < 0 ||
				payload.price % 1 !== 0 ||
				!pattern.test(payload.price) ||
				(payload.is_discount &&
					(payload.discounted_price < 0 ||
						payload.discounted_price % 1 !== 0 ||
						!pattern.test(payload.discounted_price))))
		) {
			return res.status(400).json({
				code: 400,
				message: "Invalid price value",
				data: null
			});
		}

		if (payload.is_discount && !payload.discounted_price) {
			return res.status(400).json({
				code: 400,
				message: "Please specify the discounted price",
				data: null
			});
		}

		if (!payload.is_discount && payload.discounted_price && payload.discounted_price > 0) {
			return res.status(400).json({
				code: 400,
				message: "Discounted price is not applicable",
				data: null
			});
		}

		if (payload.is_discount && payload.discounted_price >= payload.price) {
			return res.status(422).json({
				code: 422,
				message: "Discounted price cannot be equal or exceed the original price",
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
					message: "Cannot override predefined categories with the exact same name",
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
					message: "Failed to append. No category provided",
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
	try {
		const id = +req.params.id;
		const pattern = /^[1-9]\d*$/;

		if (!pattern.test(id)) {
			return res.status(400).json({
				code: 400,
				message: "Course ID must be a positive integer number",
				data: null
			});
		}

		const isCourseExist = await getCourseById(id);
		if (!isCourseExist) {
			return res.status(200).json({
				code: 200,
				message: "Course not found",
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
