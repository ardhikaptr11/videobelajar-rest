const path = require("path");

require("@dotenvx/dotenvx").config({ path: path.join(__dirname, "../../.env") });

const connection =
	process.env.NODE_ENV === "development"
		? process.env.PGURL
		: {
				user: process.env.POSTGRES_USER,
				password: process.env.POSTGRES_PASSWORD,
				host: process.env.POSTGRES_HOST,
				port: process.env.POSTGRES_PORT,
				database: process.env.POSTGRES_DATABASE
		  };

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
		connection: process.env.PGURL,
		seeds: {
			directory: path.join(__dirname, "../database/seeds")
		}
	},
	production: {
		...common
	}
};
