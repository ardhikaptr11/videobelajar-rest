const path = require("path");

require("@dotenvx/dotenvx").config({ path: path.join(__dirname, "../../.env") });

const connection = process.env.PGURL;

/**
 * @type { Object.<string, import("knex").Knex.Config }
 */

module.exports = {
	development: {
		client: "pg",
		connection,
		migrations: {
			directory: path.join(__dirname, "../database/migrations"),
			tableName: "migrations"
		},
		seeds: {
			directory: path.join(__dirname, "../database/seeds")
		},
	}
};
