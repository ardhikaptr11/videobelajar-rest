const {
	createCourse,
	getAllCourses,
	getCourseById,
	getCourseByName,
	updateCourse,
    deleteCourse
} = require("../models/courses.model");

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } _next
 */
const createNewCourse = async (req, res, _next) => {
	try {
		const { name, tagline, description, total_modules, price, thumbnail_img_url, categories } = req.body;

		if (!name || !tagline || !description || !total_modules || !price || !thumbnail_img_url || !categories) {
			return res.status(422).json({
				code: 422,
				message: "Please make sure all fields are filled in.",
				data: null
			});
		}

		const isNameTaken = await getCourseByName(name);
		if (isNameTaken) {
			return res.status(400).json({
				code: 400,
				message: "Course name already taken.",
				data: null
			});
		}

		const course = await createCourse({
			name,
			tagline,
			description,
			total_modules,
			price,
			thumbnail_img_url,
			categories
		});
		res.status(201).json({
			code: 201,
			message: "Course created successfully!",
			data: course
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			code: 500,
			message: "Internal Server Error",
			data: null
		});
	}
};

/**
 * @param { import("express").Request } _req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } _next
 */
const getCourses = async (_req, res, _next) => {
	try {
		const courses = await getAllCourses();
		res.status(200).json({
			code: 200,
			message: "Courses retrieved successfully!",
			data: courses
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			code: 500,
			message: "Internal Server Error",
			data: null
		});
	}
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } _next
 */
const getOneCourse = async (req, res, _next) => {
	try {
		const { id } = req.params;
		if (!id) {
			return res.status(422).json({
				code: 422,
				message: "Missing parameter.",
				data: null
			});
		}

		const course = await getCourseById(id);
		if (!course) {
			return res.status(404).json({
				code: 404,
				message: "Course not found.",
				data: null
			});
		}

		res.status(200).json({
			code: 200,
			message: "Course retrieved successfully!",
			data: course
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			code: 500,
			message: "Internal Server Error",
			data: null
		});
	}
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } _next
 */
const updateCourseData = async (req, res, _next) => {
	try {
		const { id } = req.params;
		const payload = req.body;
		const query = req.query;

		if (payload.categories) {
			if (query.action === "replace") {
				const updatedCourseData = await updateCourse(id, payload, query.action);
				res.status(200).json({
					code: 200,
					message: "Course updated successfully!",
					data: updatedCourseData
				});
			}

			// 	if (query.action === "add") {

			// 	}
			// }
		}

		// if (query.target === "all") {

		// }
	} catch (error) {
		console.error(error);
		res.status(500).json({
			code: 500,
			message: "Internal Server Error",
			data: null
		});
	}
};

/**
 * @param { import("express").Request } req
 * @param { import("express").Response } res
 * @param { import("express").NextFunction } _next
 */
const deleteCourseData = async (req, res, _next) => {
    const { id } = req.params;

    try {
        const isCourseExist = await getCourseById(id);
        if (!isCourseExist) {
            return res.status(400).json({
                code: 400,
                message: "Course Not Found.",
                data: null
            });
        }

        await deleteCourse(id);

        return res.status(200).json({
            code: 200,
            message: "Successfully Delete Course!",
            data: null
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: "Internal Server Error"
        });
    }
};

module.exports = { createNewCourse, getCourses, getOneCourse, updateCourseData, deleteCourseData };
