const knex = require("./knex");
const bcrypt = require("bcryptjs");

const TABLE_NAME = "users";

const create = async (data) => {
	try {
		const { fullName, email, gender, phone, password } = data;

		const isUserExist = await knex(TABLE_NAME).where({ email }).first();

        if (isUserExist) {

        }

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

const getAll = async () => {
	return knex(TABLE_NAME).select("user_id", "fullName", "email", "gender", "phone").orderBy("user_id", "asc");
};

const getUserById = async (userId) => {
	return knex(TABLE_NAME).select("user_id", "fullName", "email", "gender", "phone").where("user_id", userId).first();
};

const getUserByEmail = async (email) => {
    return knex(TABLE_NAME).where({ email }).first();
};

module.exports = {
	create,
	getAll,
	getUserById,
    getUserByEmail,
	tableName: TABLE_NAME
};
