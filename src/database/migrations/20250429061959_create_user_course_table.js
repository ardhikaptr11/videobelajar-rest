/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
	return knex.schema.createTable("user_course", (table) => {
		table.increments("id").primary();

		table
			.uuid("user_id")
			.notNullable()
			.references("user_id")
			.inTable("users")
			.onDelete("CASCADE");
		
		table
			.integer("course_id")
			.unsigned()
			.notNullable()
			.references("course_id")
			.inTable("courses")
			.onDelete("CASCADE");

		table.timestamp("enrolled_at").nullable();
		table.timestamp("completed_at").nullable();

		table.integer("progress").defaultTo(0);
		table.integer("total_module_completed").defaultTo(0);
		table.boolean("is_completed").defaultTo(false);
		
		table.timestamps({ useTimestamps: true, defaultToNow: true });

		table.unique(["user_id", "course_id"]);
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
	return knex.schema.dropTableIfExists("user_course");
};
