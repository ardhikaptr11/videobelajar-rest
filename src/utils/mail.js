const transporter = require("../config/nodemailer");
const throwError = require("../services/errorHandling.service");
const path = require("path");

const envFile = process.env.NODE_ENV === "development" ? ".env" : `.env.${process.env.NODE_ENV}`;
require("@dotenvx/dotenvx").config({ path: path.join(__dirname, "../..", envFile) });

const verifyEmailConfig = async () => {
	try {
		if (!process.env.SMTP_HOST) throwError("Host is not defined");
		if (!process.env.SMTP_PORT) throwError("Port is not defined");
		if (!process.env.SMTP_USER) throwError("User is not defined");
		if (!process.env.SMTP_PASSWORD) throwError("Password is not defined");
		if (!process.env.SMTP_SENDER) throwError("Sender is not defined");

		await transporter.verify();
		console.log("✅ Server is ready to send messages");
	} catch (error) {
		console.error("❌ Error with email configurations:", error.message);

		if (error.code === "EAUTH") throwError("Invalid email credentials");
		if (error.code === "ECONNECTION") throwError("Connection error");
		if (error.code === "EENVELOPE") throwError("Invalid email envelope");
		if (error.code === "ETIMEDOUT") throwError("Connection timed out");

		console.warn("⚠️ Email functionality may not work as expected");
	}
};

module.exports = verifyEmailConfig;
