/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
	return knex.schema.createTable("courses", (table) => {
		table.increments("course_id").primary();
		table.string("name").notNullable();
		table.string("tagline").notNullable();
		table.text("description").notNullable();
		table.string("slug").notNullable();
		table.integer("total_modules").notNullable();
		table.integer("price").notNullable();
		table.integer("discounted_price").defaultTo(0);
		table.boolean("is_discount").defaultTo(false);
		table.text("thumbnail_img_url").nullable();
		table.timestamp("created_at").defaultTo(knex.fn.now());
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
	return knex.schema.dropTableIfExists("courses");
};
