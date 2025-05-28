const express = require("express");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const YAML = require("js-yaml");
const path = require("path");

const router = express.Router();

const filePath = path.join(path.join(__dirname, "../..", "docs/docs.yaml"));
const fileContent = fs.readFileSync(filePath, "utf-8");
const swaggerDocument = YAML.load(fileContent);

const swaggerDocs = (app) => {
	const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

	app.use("/docs/api/v2", swaggerUi.serve, swaggerUi.setup(swaggerDocument, { customCssUrl: CSS_URL }));
};

module.exports = swaggerDocs;
