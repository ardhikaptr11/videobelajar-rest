const path = require("path");

const envFile = process.env.NODE_ENV === "development" ? ".env" : `.env.${process.env.NODE_ENV}`;

require("@dotenvx/dotenvx").config({ path: path.join(__dirname, "../../", envFile) });

const connection =
	process.env.NODE_ENV === "development"
		? process.env.POSTGRES_URL_DEV
		: process.env.NODE_ENV === "test"
		? process.env.POSTGRES_URL_TEST
		: process.env.POSTGRES_URL;

const common = {
	client: "pg",
	connection,
	migrations: {
		directory: path.join(__dirname, "../database/migrations"),
		tableName: "migrations"
	}
};

/**
 * @type { Object.<string, import("knex").Knex.Config }
 */
module.exports = {
	development: {
		...common,
		seeds: {
			directory: path.join(__dirname, "../database/seeds")
		}
	},
	production: {
		...common
	},
	test: {
		...common,
		seeds: {
			directory: path.join(__dirname, "../database/seeds")
		}
	}
};
