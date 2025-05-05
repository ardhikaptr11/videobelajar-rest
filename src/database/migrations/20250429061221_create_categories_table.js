/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
	return knex.schema.createTable("categories", (table) => {
		table.increments("category_id").primary();
		table.string("name", 50).unique().notNullable();
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
	return knex.schema.dropTableIfExists("categories");
};
