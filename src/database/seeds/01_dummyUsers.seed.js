const { Faker, id_ID } = require("@faker-js/faker");
const { v4: uuidv4 } = require("uuid");

const { createUser } = require("../../models/users.model");

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

const generateVerifToken = () => {
	const uuid = uuidv4();
	const token = uuid.split("-")[0];

	return token;
};

/**
 * @param { import("knex").Knex } knex
 *
 * @returns { Promise<void> }
 */
exports.seed = async (knex) => {
	console.log("Truncating table");
	await knex.raw("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

	console.log("Inserting users dummy data");

	await Promise.all(
		users.map((user) => {
			const defaultPassword = `${user.full_name.split(" ")[0].toLowerCase()}123!`;

			const name = user.gender === "male" ? "Oliver" : "Eliza";
			const queries = `seed=${name}&radius=20&size=250&backgroundColor=b6e3f4&clothing=collarAndSweater&eyes=closed,default,eyeRoll,happy,hearts,side,squint,surprised,wink,winkWacky,xDizzy`;

			const defaultAvatarUrl = `https://api.dicebear.com/9.x/avataaars/png/${queries}`;

			return createUser({
				full_name: user.full_name,
				email: user.email,
				gender: user.gender,
				phone: user.phone,
				password: defaultPassword,
				verif_token: generateVerifToken(),
				avatar_url: defaultAvatarUrl
			});
		})
	);

	console.log("Seeding completed");
};
