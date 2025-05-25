const generateVerificationEmailContent = ({ name = "User", verificationURL }) => {
	return `
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8" />
                <title>Verify Your Email</title>
            </head>
            <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f9f9f9;">
                <table width="100%" cellpadding="0" cellspacing="0" style="padding: 30px 0;">
                <tr>
                    <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                        <tr>
                        <td style="background-color:#3ecf4c; color:#ffffff; padding:20px; text-align:center;">
                            <h1 style="margin:0;">Videobelajar</h1>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding:30px;">
                            <p style="font-size:16px;">Hi ${name.split(" ")[0]},</p>
                            <p style="color:#1d2433;">Thank you for joining us. We're excited to have you as a member!</p>

                            <p style="font-size:16px; color:#1d2433;"> Please complete your registration by verifying your email address via the following link:</p>
                            <div style="text-align:center; margin: 30px 0;">
                            <a href="${verificationURL}" style="background-color:#3ecf4c; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:5px; display:inline-block; font-size:16px;">
                                Verify Email
                            </a>
                            </div>
                            <p style="font-size:14px; color:#666;"> If you think this is a mistake, you can safely ignore this email.</p>
                            <p style="font-size:14px; color:#666;"> Any questions or assistance can be submitted directly through our support team.</p><br>
                            <p style="font-size:16px; color:#1d2433;">Best regards,</p>
                            <p style="font-size:16px; color:#1d2433;">The Team</p>
                        </td>
                        </tr>
                        <tr>
                        <td style="background-color:#f0f0f0; padding:20px; text-align:center; font-size:12px; color:#999;">
                            &copy; ${new Date().getFullYear()} Videobelajar. All rights reserved.
                        </td>
                        </tr>
                    </table>
                    </td>
                </tr>
                </table>
            </body>
        </html>
    `;
};

module.exports = { generateVerificationEmailContent };
