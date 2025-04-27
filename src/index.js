const path = require("path");

require("@dotenvx/dotenvx").config({ path: path.join(__dirname, "../.env") });

const express = require("express");
const routes = require("./routes");
const userRouter = require("./routes/user.router");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routes);

/**
 * @type { import("express").Request } _req
 * @type { import("express").Response } res
 * @type { import("express").NextFunction } _next
 */
app.get("/api/v1", (_req, res, _next) => {
    res.send({
        serverMessage: "Server is running.",
        serverTime: new Date().toLocaleString()
    });
});

const SERVER_PORT = process.env.SERVER_PORT || 8765;

app.listen(process.env.SERVER_PORT || 8765, () => {
	console.clear();
	console.log(`Server is running on port ${SERVER_PORT}.`);
});
