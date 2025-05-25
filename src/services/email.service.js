const transporter = require("../config/nodemailer");

const { generateVerificationEmailContent } = require("../utils/emailContent");

const sendEmail = async (to, subject, content) => {
	const html = content;

	try {
		const mailOptions = {
			from: process.env.SMTP_SENDER,
			to,
			subject,
			html
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("✅ Email has been sent successfully:", info.messageId);
		return info;
	} catch (error) {
		console.error("❌ Failed to send email:", error);
	}
};

const sendVerificationEmail = async (user, token) => {
	const url = process.env.VERCEL_URL || "http://localhost:8765";
	const verificationURL = `${url}/api/v2/auth/verify-email?token=${token}`;

	const subject = "[Required] - Verify your Email";
	const content = generateVerificationEmailContent({ name: user.full_name, verificationURL });

	return await sendEmail(user.email, subject, content);
};

module.exports = { sendVerificationEmail };
