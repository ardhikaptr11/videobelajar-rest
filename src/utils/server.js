const express = require("express");
const cors = require("cors");

const routes = require("../routes");

const createServer = () => {
    const app = express();

	app.use(express.urlencoded({ extended: true }));
	app.use(express.json());
	app.use(cors());

	app.use(routes);

    return app;
}

module.exports = createServer;