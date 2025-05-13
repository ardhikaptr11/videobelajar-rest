/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
	return knex.schema.alterTable("users", (table) => {
		table.string("verif_token", 8).notNullable().alter();
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
	return knex.schema.alterTable("users", (table) => {
		table.string("verif_token", 8).nullable().alter();
	});
};
