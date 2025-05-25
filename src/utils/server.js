const express = require("express");
const cors = require("cors");

const routes = require("../routes");
const { globalErrorHandler } = require("../middleware/error.middleware");

const createServer = () => {
	const app = express();

	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());
	app.use(cors());

	app.use(routes);
	app.use(globalErrorHandler);

	return app;
};

module.exports = createServer;
