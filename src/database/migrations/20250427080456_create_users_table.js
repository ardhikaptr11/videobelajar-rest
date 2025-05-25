/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
	return knex.schema.createTable("users", (table) => {
		table.uuid("user_id").defaultTo(knex.fn.uuid()).primary();

		table.string("full_name", 100).notNullable();
		table.string("email").notNullable().unique();
		table
			.enu("gender", ["male", "female"], {
				useNative: true,
				enumName: "gender_enum"
			})
			.notNullable(),
		table.string("phone", 20).notNullable();
		table.text("password").notNullable(), 
		table.string("avatar_url").nullable(),
		table.string("verif_token", 8).notNullable();
		table.bool("is_verified").defaultTo(false);

		table.timestamps({ useTimestamps: true, defaultToNow: true });
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async (knex) => {
	await knex.schema.dropTableIfExists("users");
	await knex.raw("DROP TYPE IF EXISTS gender_enum");
};
