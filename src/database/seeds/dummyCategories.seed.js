const knex = require("../../models/knex");

const predefinedCategories = [
	"Web Development",
	"Internet Technologies",
	"Design & Multimedia",
	"Math & Logic",
	"Statistics",
	"Security Development",
	"Data & Analytics"
];

const dummyData = predefinedCategories.map((category) => ({
	name: category
}));

/**
 * @param { import("knex").Knex } knex
 *
 * @returns { Promise<void> }
 */
exports.seed = async (knex) => {
	console.log("Truncating table");
	await knex.raw("TRUNCATE TABLE categories RESTART IDENTITY CASCADE");

    // Deletes all existing entries
    if (await knex("categories").select("*").length > 0) {
        console.log("Deleting all existing entries");
        await knex("categories").del();
    }

	// Inserts seed entries
	console.log("Inserting courses dummy data");
	await Promise.all(
		dummyData.map((category) => {
			return knex("categories").insert(category);
		})
	);

	console.log("Seeding completed");
};