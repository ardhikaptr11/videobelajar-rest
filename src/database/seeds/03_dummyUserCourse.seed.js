const { faker } = require("@faker-js/faker");

const knex = require("../../models/knex");
const { tableName: usersTable } = require("../../models/users.model");
const { tableName: coursesTable } = require("../../models/courses.model");

/**
 * @param { import("knex").Knex } knex
 *
 * @returns { Promise<void> }
 */
exports.seed = async (knex) => {
	console.log("Truncating table");
	await knex.raw("TRUNCATE TABLE user_course RESTART IDENTITY CASCADE");

	const users = await knex(usersTable).select("user_id");
	const courseIds = await knex(coursesTable).select("course_id");

	console.log("Inserting courses dummy data");

	await Promise.all(
		users.map((user) => {
			const randomCourseId = courseIds[Math.floor(Math.random() * courseIds.length)].course_id;
			const enrolledDate = faker.date.between({ from: "2024-01-01", to: "2025-03-31" });

			return knex("user_course").insert({
				user_id: user.user_id,
				course_id: randomCourseId,
				enrolled_at: enrolledDate
			});
		})
	);
};
