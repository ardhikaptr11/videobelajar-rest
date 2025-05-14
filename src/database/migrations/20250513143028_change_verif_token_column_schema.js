/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
	await knex.schema.alterTable("users", (table) => {
		table.string("verif_token", 8).notNullable().alter();
	});

	await knex("users").where("is_verified", false).update({ is_verified: true });
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
