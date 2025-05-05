const express = require("express");
const router = express.Router();
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const swaggerDocument = YAML.load(path.join(__dirname, "../../docs.yaml"));

const swaggerDocs = (app) => {
	app.use("/docs/api/v1", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = swaggerDocs;