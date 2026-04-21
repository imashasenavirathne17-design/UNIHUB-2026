const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        let transporter;

        // Check if real email credentials are provided in the .env file
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            transporter = nodemailer.createTransport({
                service: 'gmail', // Use Gmail as the default provider
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        } else {
            // Generate test SMTP service account from ethereal.email if no real credentials exist
            let testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });
        }

        const mailOptions = {
            from: '"UniHub System Node" <noreply@unihub.edu>',
            to: options.email,
            subject: options.subject,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log("------------------------------------------------------------------");
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            console.log(`[LIVE EMAIL SENT] -> Successfully delivered to ${options.email}: ${options.subject}`);
        } else {
            console.log(`[SANDBOX EMAIL LOCALLY] -> Sent to ${options.email}: ${options.subject}`);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }
        console.log("------------------------------------------------------------------");
        
    } catch (err) {
        console.error("Email Service Error:", err);
    }
};

module.exports = sendEmail;
