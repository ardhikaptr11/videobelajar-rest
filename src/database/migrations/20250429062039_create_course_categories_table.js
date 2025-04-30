/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
	return knex.schema.createTable("course_categories", (table) => {
		table.increments("id").primary();
		table
			.integer("course_id")
			.unsigned()
			.notNullable()
			.references("course_id")
			.inTable("courses")
			.onDelete("CASCADE");
		table
			.integer("category_id")
			.unsigned()
			.notNullable()
			.references("category_id")
			.inTable("categories")
			.onDelete("CASCADE");
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
	return knex.schema.dropTableIfExists("course_categories");
};
