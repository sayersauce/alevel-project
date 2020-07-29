/**
 * Emailing functions
 */

const config = require("./config");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
           user: config.email.user,
           pass: config.email.pass
       }
});
   
function sendEmail(recipients, subject, text) {
    // Sends an email
    const mail = {
        from: `${config.email.name} <${config.email.user}>`,
        to: recipients,
        subject: subject,
        text: text
    };

    transporter.sendMail(mail, (err, info) => {
        if (err) console.err(err);
    });
}

module.exports = {sendEmail};
