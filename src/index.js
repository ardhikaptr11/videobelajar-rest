const path = require("path");

require("@dotenvx/dotenvx").config({ path: path.join(__dirname, "../.env") });

const express = require("express");
const routes = require("./routes");
const swaggerDocs = require("./utils/swagger");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routes);

const SERVER_PORT = process.env.SERVER_PORT || 8765;

/**
 * @type { import("express").Request } _req
 * @type { import("express").Response } res
 * @type { import("express").NextFunction } _next
 */
app.get("/api/v1", (_req, res, _next) => {
	res.send({
		serverMessage: `Server is up and running. Docs are available at http://localhost:${SERVER_PORT}/docs/api/v1`,
		serverTime: new Date().toLocaleString()
	});
});

app.listen(process.env.SERVER_PORT || 8765, () => {
	console.clear();
	console.log(`Server is running on port ${SERVER_PORT}.`);

	swaggerDocs(app, SERVER_PORT);
});
