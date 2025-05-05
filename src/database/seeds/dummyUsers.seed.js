const userModel = require("../../models/users.model");

const { Faker, id_ID } = require("@faker-js/faker");

const customFaker = new Faker({
	locale: [id_ID]
});

const createRandomUsers = () => {
	const sex = customFaker.person.sexType();
	const firstName = customFaker.person.firstName(sex);
	const lastName = customFaker.person.lastName(sex);
	const email = customFaker.internet.email({
		firstName: firstName.toLowerCase(),
		lastName: lastName.toLowerCase(),
		provider: "example.com"
	});
	const phone = customFaker.helpers.fromRegExp(/08[1-9][0-9]{7,10}/);
	return {
		full_name: `${firstName} ${lastName}`,
		email,
		gender: sex,
		phone
	};
};

const users = Array.from({ length: 10 }, () => createRandomUsers());

/**
 * @param { import("knex").Knex } knex
 *
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
	
	console.log("Truncating table");
	await knex.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
	
	console.log("Inserting users dummy data");
	
	await Promise.all(
		users.map((user) => {
			const defaultPassword = `${user.full_name.split(" ")[0].toLowerCase()}123!`;

			return userModel.createUser({
				full_name: user.full_name,
				email: user.email,
				gender: user.gender,
				phone: user.phone,
				password: defaultPassword
			});
		})
	);

	console.log("Seeding completed");
};
