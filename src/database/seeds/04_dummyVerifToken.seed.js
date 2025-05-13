const { v4: uuidv4 } = require("uuid");

const { tableName } = require("../../models/users.model");

const generateVerifToken = () => {
	const uuid = uuidv4();
	const token = uuid.split("-")[0];

	return token;
};

exports.seed = async (knex) => {
	const users = await knex(tableName).select("user_id");

	console.log("Inserting verification token dummy data");

	await Promise.all(
		users.map((user) =>
			knex(tableName).update({ verif_token: generateVerifToken() }).where("user_id", user.user_id)
		)
	);

	console.log("Seeding completed");
};