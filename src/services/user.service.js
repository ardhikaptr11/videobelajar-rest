const knex = require("../models/knex");
const { getUserById, updateUser, deleteUser } = require("../models/users.model");

const accessUserDataByRole = (role, targetId) => {
	if (role === "user") {
		return knex.transaction(async (trx) => {
			await trx.raw(`SET LOCAL app.role = '${role}'`);
			await trx.raw(`SET LOCAL app.current_user_id = '${targetId}'`);
			return getUserById(trx, targetId);
		});
	}

	return knex.transaction(async (trx) => {
		await trx.raw(`SET LOCAL app.role = '${role}'`);
		return getUserById(trx, targetId);
	});
};

const updateUserDataByRole = async (role, targetId, data) => {
	if (role === "user") {
		return knex.transaction(async (trx) => {
			await trx.raw(`SET LOCAL app.role = '${role}'`);
			await trx.raw(`SET LOCAL app.current_user_id = '${targetId}'`);
			return updateUser(trx, targetId, data);
		});
	}

	return knex.transaction(async (trx) => {
		await trx.raw(`SET LOCAL app.role = '${role}'`);
		return updateUser(trx, targetId, data);
	});
};

const deleteUserDataByRole = async (role, targetId) => {
	if (role === "user") {
		return knex.transaction(async (trx) => {
			await trx.raw(`SET LOCAL app.role = '${role}'`);
			await trx.raw(`SET LOCAL app.current_user_id = '${targetId}'`);
			return deleteUser(trx, targetId);
		});
	}

	return knex.transaction(async (trx) => {
		await trx.raw(`SET LOCAL app.role = '${role}'`);
		return deleteUser(trx, targetId);
	});
};

module.exports = { accessUserDataByRole, updateUserDataByRole, deleteUserDataByRole };
