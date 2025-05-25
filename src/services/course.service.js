const { faker } = require("@faker-js/faker");

const {
	createCourse,
	createCategory,
	createCourseModules,
	createCourseCategoryRelation,
	getAllCourses,
	getCourseById,
	getCourseByName,
	getCourseCategories,
	getCategoryIdByName,
	getTotalEnrolledStudents,
	updateCourse,
	deleteCourse,
	deleteCategory
} = require("../models/courses.model");

const knex = require("../models/knex");

const createNewCourse = async (data) => {
	const { name, tagline, description, price, thumbnail_img_url, categories, modules } = data;

	const categoryNames = data.categories;
	const slug = faker.helpers.slugify(name.replace(/\/| - |-/g, " ").toLowerCase());

	const newCourse = await knex.transaction(async (trx) => {
		// Only admin can create a new course
		await trx.raw(`SET LOCAL app.role = 'admin'`)

		// Maps categories to their respective IDs in an array, missing category is marked with null
		const categoryMappedIds = await Promise.all(categoryNames.map((name) => getCategoryIdByName(trx, name)));

		// Flow:
		// 1. If all the given categories do not exist in the database, create an entry for each category and create a relationship between the course and each category, e.g [null, null, null]
		// 2. If one or more of the given categories exist in the database and others do not, create an entry only for the missing category and create a relationship between the course and each category, e.g [1, 2, null]

		if (categoryMappedIds.some((id) => id === null)) {
			// Find the indexes of the null values in an array
			const nullIndexes = categoryMappedIds
				.map((val, idx) => (val === null ? idx : -1))
				.filter((val) => val !== -1);

			// Get the names of the missing categories
			const unknownCategories = nullIndexes.map((idx) => categoryNames[idx]);

			const newCategoryIds = await Promise.all(unknownCategories.map((name) => createCategory(trx, name)));

			categoryMappedIds.splice(0, categoryMappedIds.length, ...newCategoryIds);
		}

		const [course] = await createCourse(trx, {
			name,
			tagline,
			description,
			slug,
			price,
			thumbnail_img_url
		});

		await createCourseModules(trx, course.course_id, modules);

		course.total_students_enrolled = 0;
		course.categories = categories;

		await createCourseCategoryRelation(trx, course.course_id, categoryMappedIds);

		return course;
	});

	return newCourse;
};

const updateCourseData = async (courseId, data, mode = "default") => {
	const categoryNames = data.categories;

	const result = await knex.transaction(async (trx) => {
		// Only admin can update course data
		await trx.raw(`SET LOCAL app.role = 'admin'`);

		const currentCategories = await getCourseCategories(trx, courseId);

		// Array of current category IDs
		const currentCategoryIds = currentCategories.map((c) => c.category_id);

		// Array of IDs of the given categories from data
		// e.g data.categories = ["Web Development", "Internet Technologies"] -> categoryMappedIds = [1, 2]
		const categoryMappedIds = categoryNames
			? await Promise.all(categoryNames.map((name) => getCategoryIdByName(trx, name)))
			: null;

		if (data.name) {
			const slug = faker.helpers.slugify(data.name.replace(/\/| - |-/g, " ").toLowerCase());
			data.slug = slug;
		}

		const availableMode = ["default", "strict"];
		if (!availableMode.includes(mode)) return;

		const nullIndexes = categoryNames
			? categoryMappedIds.map((val, idx) => (val === null ? idx : -1)).filter((val) => val !== -1)
			: null;

		if (mode === "strict") {
			if (nullIndexes && nullIndexes.length === 0) return;

			if (!categoryNames) {
				await updateCourse(trx, courseId, data);
				return await getCourseById(courseId);
			}

			const unknownCategories = nullIndexes.map((idx) => categoryNames[idx]);

			const newCategoryIds = await Promise.all(unknownCategories.map((name) => createCategory(trx, name)));

			categoryMappedIds.splice(0, categoryMappedIds.length, ...newCategoryIds);
		} else {
			if (currentCategoryIds.some((id) => categoryMappedIds.includes(id))) return;

			await deleteCategory(trx, courseId, currentCategoryIds);

			if (nullIndexes.length !== 0) {
				const unknownCategories = nullIndexes.map((idx) => categoryNames[idx]);
				const newCategoryIds = await Promise.all(unknownCategories.map((name) => createCategory(trx, name)));

				categoryMappedIds.splice(0, categoryMappedIds.length, ...newCategoryIds);
			}
		}

		await createCourseCategoryRelation(trx, courseId, categoryMappedIds);

		delete data.categories;

		const [updatedCourse] = await updateCourse(trx, courseId, data);
		updatedCourse.total_students_enrolled = await getTotalEnrolledStudents(trx, courseId);

		return updatedCourse;
	});

	const { categories } = await getCourseById(courseId);

	if (result) {
		result.categories = categories;
	}

	return result;
};

const accessCoursesDataByRole = (filters = {}, role) => {
	return knex.transaction(async (trx) => {
		await trx.raw(`SET LOCAL app.role = '${role}'`);
		return getAllCourses(trx, filters);
	});
};

module.exports = { createNewCourse, updateCourseData, accessCoursesDataByRole };
