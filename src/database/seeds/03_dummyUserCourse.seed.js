const { faker } = require("@faker-js/faker");

const knex = require("../../models/knex");
const coursesModel = require("../../models/courses.model");

/**
 * @param { import("knex").Knex } knex
 *
 * @returns { Promise<void> }
 */
exports.seed = async (knex) => {
	console.log("Truncating table");
	await knex.raw("TRUNCATE TABLE user_course RESTART IDENTITY CASCADE");

	const courseIds = await knex(coursesModel.tableName).select("course_id");

	const dummyData = new Array(10).fill(null).map(() => {
		const randomCourseId = courseIds[Math.floor(Math.random() * courseIds.length)].course_id;

		const enrolledDate = faker.date.between({ from: "2024-01-01", to: "2025-03-31" });

		return {
			user_id: Math.floor(Math.random() * 10) + 1,
			course_id: randomCourseId,
			enrolled_at: enrolledDate
		};
	});

	console.log("Inserting courses dummy data");

	await Promise.all(
		dummyData.map((data) => {
			return knex("user_course").insert(data);
		})
	);
};
