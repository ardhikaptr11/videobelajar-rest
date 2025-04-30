const knex = require("../../models/knex");

const predefinedCategoryIds = [
	[2, 6, 7],
	[1, 3, 5],
	[2, 6, 7],
	[1, 3, 5],
	[1, 3, 5],
	[2, 4, 6],
	[2, 6],
	[4, 6],
	[1, 3, 5, 6],
	[6],
	[4],
	[2, 4, 6, 7]
];

/**
 * @param { import("knex").Knex } knex
 *
 * @returns { Promise<void> }
 */
exports.seed = async (knex) => {
	const courseIds = await knex("courses").select("course_id");
	const categoryIds = await knex("categories").select("category_id");

	const dummyData = new Array(courseIds.length).fill(null).map((_, index) => ({
		courseId: courseIds[index].course_id,
		categoryIds: predefinedCategoryIds[index]
	}));

	const dataToInsert = dummyData.flatMap((entry) => {
		return entry.categoryIds.map((categoryId) => ({
			course_id: entry.courseId,
			category_id: categoryId
		}));
	});
	
	console.log("Truncating table");
	await knex.raw("TRUNCATE TABLE course_categories RESTART IDENTITY CASCADE");

	console.log("Inserting dummy data");
	await Promise.all(
		dataToInsert.map((data) => {
			return knex("course_categories").insert(data);
		})
	);

	console.log("Seeding completed");
};
