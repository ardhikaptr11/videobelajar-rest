const nodemailer = require("nodemailer");
const path = require("path");

const envFile = process.env.NODE_ENV === "development" ? ".env" : `.env.${process.env.NODE_ENV}`;
require("@dotenvx/dotenvx").config({ path: path.join(__dirname, "../..", envFile) });

let transporter;

try {
	const config =
		process.env.NODE_ENV === "development"
			? {
					host: process.env.SMTP_HOST,
					port: Number(process.env.SMTP_PORT),
					auth: {
						user: process.env.SMTP_USER,
						pass: process.env.SMTP_PASSWORD
					}
			  }
			: {
					host: "smtp.sendgrid.net",
					port: 587,
					auth: {
						user: process.env.SMTP_USERNAME,
						pass: process.env.SMTP_PASSWORD
					}
			  };

	transporter = nodemailer.createTransport(config);
} catch (error) {
	console.error("Email transporter failed to create:", error);

	transporter = {
		sendEmail: (options) => {
			console.log("This email should be sent to:", {
				To: options.to,
				From: options.from,
				Subject: options.Subject
			});
			return Promise.resolve({ id: "mockId", response: "mockResponse" });
		},
		verify: () => Promise.resolve(true)
	};
}

module.exports = transporter;
