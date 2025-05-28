const {
	createCourse,
	getAllCourses,
	getCourseById,
	getCourseByName,
	deleteCourse
} = require("../models/courses.model");

const { createNewCourse, updateCourseData, accessCoursesDataByRole } = require("../services/course.service");
const throwError = require("../services/errorHandling.service");

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const handleCreateNewCourse = async (req, res, next) => {
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

		return res.status(201).json({ code: 201, message: "Course created successfully!", data: course });
	} catch (error) {
		next(error);
	}
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const handleGetAllCourses = async (req, res, next) => {
	try {
		const { role } = req.user;
		const filters = req.query;

		const courses = filters ? await accessCoursesDataByRole(filters, role) : await accessCoursesDataByRole(role);

		if (Object.keys(filters).length === 0) {
			if (courses.length === 0) {
				return res.status(200).json({
					code: 200,
					message: "No data recorded yet",
					data: null
				});
			}
		}

		if (filters && courses.length === 0) {
			return res.status(404).json({
				code: 404,
				message: "Course not found",
				data: courses
			});
		}

		if (filters && courses.length === 1) {
			const [course] = courses;

			return res.status(200).json({
				code: 200,
				message: "Course successfully retrieved!",
				data: course
			});
		}

		return res.status(200).json({
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
		next(error);
	}
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const handleGetOneCourse = async (req, res, next) => {
	try {
		const { id } = req.params;
		const course = await getCourseById(id);

		if (!course) {
			return res.status(404).json({
				code: 404,
				message: "Course not found",
				data: null
			});
		}

		return res.status(200).json({
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
		next(error);
	}
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const handleUpdateCourseData = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { mode } = req.query;
		const payload = req.body;

		const isCourseExist = await getCourseById(id);
		if (!isCourseExist) {
			return res.status(404).json({
				code: 404,
				message: "Course not found",
				data: null
			});
		}

		const updatedCourseData = await updateCourseData(id, payload, mode);

		if (!updatedCourseData) {
			mode === "default" || !mode
				? throwError("Cannot override predefined categories with the exact same name", 409)
				: throwError("Course already has the intended category", 409);
		}

		return res.status(200).json({
			code: 200,
			message: "Successfully updated course data!",
			data: updatedCourseData
		});
	} catch (error) {
		next(error);
	}
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } next
 */
const handleDeleteCourseData = async (req, res, next) => {
	try {
		const { id } = req.params;
		await deleteCourse(id);

		return res.status(200).json({ code: 200, message: "Course successfully deleted!", data: null });
	} catch (error) {
		next(error);
	}
};

module.exports = {
	handleCreateNewCourse,
	handleGetAllCourses,
	handleGetOneCourse,
	handleUpdateCourseData,
	handleDeleteCourseData
};
