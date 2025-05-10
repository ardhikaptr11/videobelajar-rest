const createServer = require("./utils/server");
const path = require("path");
require("@dotenvx/dotenvx").config({ path: path.join(__dirname, "../.env") });

const swaggerDocs = require("./utils/swagger");

const app = createServer();

swaggerDocs(app);

const SERVER_PORT = process.env.SERVER_PORT || 8765;
const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * @type { import("express").Request } _req
 * @type { import("express").Response } res
 * @type { import("express").NextFunction } _next
 */
app.get("/", (_req, res, _next) => {
	const baseUrl =
		NODE_ENV === "development" ? `http://localhost:${SERVER_PORT}` : `https://14040-videobelajar-rest.vercel.app`;

	res.send({
		serverMessage: `Server is up and running. Docs are available at ${baseUrl}/docs/api/v1`,
		serverTime: new Date().toLocaleString()
	});
});

if (NODE_ENV === "development") {
	app.listen(SERVER_PORT, () => {
		console.clear();
		console.log(`Server is running on http://localhost:${SERVER_PORT}`);
	});
}

module.exports = app;
