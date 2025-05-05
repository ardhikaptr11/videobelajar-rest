const path = require("path");

require("@dotenvx/dotenvx").config({ path: path.join(__dirname, "../../.env") });

const connection =
	process.env.NODE_ENV === "development"
		? process.env.PGURL
		: {
				user: process.env.PGUSER,
				password: process.env.PGPASSWORD,
				host: process.env.PGHOST,
				port: process.env.SERVER_PORT,
				database: process.env.PGDATABASE
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
