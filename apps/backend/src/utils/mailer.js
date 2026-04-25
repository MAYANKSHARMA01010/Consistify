const nodemailer = require("nodemailer");
const { env } = require("../configs/env");

const getTransporter = () => {
    const user = env.CONTACT_EMAIL_USER;
    const pass = env.CONTACT_EMAIL_PASS;

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user,
            pass,
        },
    });
};

const sendEmail = async ({ to, subject, text, html }) => {
    const transporter = getTransporter();

    if (!transporter) {
        console.warn("[mailer] SMTP is not configured. Email payload:", { to, subject, text });
        return false;
    }

    await transporter.sendMail({
        from: env.CONTACT_EMAIL_USER,
        to,
        subject,
        text,
        html,
    });

    return true;
};

module.exports = {
    sendEmail,
};
