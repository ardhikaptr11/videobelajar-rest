const nodemailer = require("nodemailer");

const createTransport = () => {
	const config =
		process.env.NODE_ENV === "development"
			? {
					host: "smtp.ethereal.email",
					port: 587,
					secure: false,
					auth: {
						user: process.env.ETHEREAL_USERNAME,
						pass: process.env.ETHEREAL_PASSWORD
					}
			  }
			: {
					host: "smtp.sendgrid.net",
					port: 587,
					secure: false,
					auth: {
						user: process.env.SMTP_USERNAME,
						pass: process.env.SMTP_PASSWORD
					}
			  };
	const transporter = nodemailer.createTransport(config);

	return transporter;
};

module.exports = createTransport;