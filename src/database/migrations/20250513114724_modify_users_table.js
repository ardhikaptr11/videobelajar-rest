/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
	await knex.schema.alterTable("users", (table) => {
		table.string("verif_token", 8).nullable();
		table.bool("is_verified").defaultTo(false);
	});

	await knex("users").whereNull("is_verified").update({ is_verified: false });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
    return knex.schema.alterTable("users", (table) => {
		table.dropColumns("verif_token", "is_verified");
	});
};
