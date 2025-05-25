/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async (knex) => {
	const users = await knex("users").select("user_id", "gender");

	for (const user of users) {
		const name = user.gender === "male" ? "Oliver" : "Eliza";
		const queries = `seed=${name}&radius=20&size=250&backgroundColor=b6e3f4&clothing=collarAndSweater&eyes=closed,default,eyeRoll,happy,hearts,side,squint,surprised,wink,winkWacky,xDizzy`;

		const defaultAvatarUrl = `https://api.dicebear.com/9.x/avataaars/png/${queries}`;

		await knex("users").where("user_id", user.user_id).update({ avatar_url: defaultAvatarUrl });
	}

	await knex.schema.alterTable("users", (table) => {
		table.string("avatar_url").notNullable().alter();
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = (knex) => {
	return knex.schema.alterTable("users", (table) => {
		table.dropColumn("avatar_url");
	});
};
