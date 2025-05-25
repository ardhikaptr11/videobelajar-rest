/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
	return knex("users").where("is_verified", false).update({ is_verified: true });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
	return knex("users").where("is_verified", true).update({ is_verified: false });
};
