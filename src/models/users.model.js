const knex = require("./knex");
const bcrypt = require("bcryptjs");

const TABLE_NAME = "users";

const createUser = async (data) => {
	const { full_name, email, gender, phone, password, verif_token, avatar_url } = data;

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	const [user] = await knex(TABLE_NAME)
		.insert({
			full_name,
			email,
			gender,
			phone,
			password: hashedPassword,
			verif_token,
			avatar_url
		})
		.returning(["user_id", "full_name", "email", "verif_token", "is_verified", "created_at"]);

	return user;
};

const getAllUsers = async () => {
	return knex.transaction(async (trx) => {
		await trx.raw(`SET LOCAL app.role = 'admin'`);
		return trx(TABLE_NAME).select("user_id", "full_name", "email", "gender", "phone").orderBy("full_name", "asc");
	});
};

const getUserById = async (trx, userId) => {
	return trx(TABLE_NAME)
		.select("user_id", "full_name", "email", "gender", "phone", "avatar_url", "verif_token", "is_verified")
		.where("user_id", userId)
		.first();
};

const getUserByEmail = async (email) => {
	return knex.transaction(async (trx) => {
		await trx.raw(`SET LOCAL app.role = 'anonymous'`);
		await trx.raw(`SET LOCAL app.email = '${email}'`);
		return trx(TABLE_NAME).where({ email }).first();
	});
};

const getUserByVerifToken = async (token) => {
	return knex.transaction(async (trx) => {
		await trx.raw(`SET LOCAL app.role = 'anonymous'`);
		await trx.raw(`SET LOCAL app.verif_token = '${token}'`);
		return trx(TABLE_NAME).where({ verif_token: token }).first();
	});
};

const updateUser = async (trx, userId, data) => {
	const [result] = await trx(TABLE_NAME)
		.update(data)
		.where("user_id", userId)
		.returning(["user_id", "full_name", "email", "phone", "is_verified", "avatar_url"]);

	return result;
};

const deleteUser = async (trx, userId) => {
	return trx(TABLE_NAME).where("user_id", userId).del();
};

module.exports = {
	createUser,
	getAllUsers,
	getUserById,
	getUserByEmail,
	getUserByVerifToken,
	updateUser,
	deleteUser,
	tableName: TABLE_NAME
};
