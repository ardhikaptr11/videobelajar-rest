const knex = require("./knex");
const bcrypt = require("bcryptjs");

const TABLE_NAME = "users";

const createUser = async (data) => {
	try {
		const { fullName, email, gender, phone, password } = data;

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		return knex(TABLE_NAME).insert({
			fullName,
			email,
			gender,
			phone,
			password: hashedPassword
		});
	} catch (error) {
		console.error(error);
		return {
			code: 500,
			message: "Internal Server Error",
			data: null
		};
	}
};

const getAllUsers = async () => {
	return knex(TABLE_NAME).select("user_id", "fullName", "email", "gender", "phone").orderBy("user_id", "asc");
};

const getUserById = async (userId) => {
	return knex(TABLE_NAME).select("user_id", "fullName", "email", "gender", "phone").where("user_id", userId).first();
};

const getUserByEmail = async (email) => {
	return knex(TABLE_NAME).where({ email }).first();
};

const updateUser = async (userId, data) => {
	const result = await knex(TABLE_NAME)
		.update(data)
		.where("user_id", userId)
		.returning(["user_id", "fullName", "email", "phone"]);

	return result;
};

const deleteUser = async (userId) => {
	return knex(TABLE_NAME).where("user_id", userId).del();
}

module.exports = {
	createUser,
	getAllUsers,
	getUserById,
	getUserByEmail,
	updateUser,
	deleteUser,
	tableName: TABLE_NAME
};
