const nodemailer = require("nodemailer");

const getTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
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
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
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
