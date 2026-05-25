// import { Resend } from "resend";
// import ejs from "ejs";
// import path from "path";
// import config from "../config";

// const resend = new Resend(config.RESEND_API_KEY);

// interface EmailOptions {
//   email: string;
//   subject: string;
//   template: string;
//   data: { [key: string]: any };
// }

// const sendMail = async (options: EmailOptions): Promise<void> => {
//   const { email, subject, template, data } = options;

//   // Get the path to the email template
//   const templatePath = path.join(__dirname, "../mails", template);

//   // Render with EJS
//   const html: string = await ejs.renderFile(templatePath, data);

//   // Send with Resend
//   await resend.emails.send({
//     from: "Scoob Invoice <onboarding@happinessani.com>",
//     to: email,
//     subject,
//     html,
//   });
// };

// export default sendMail;

import nodemailer, { Transporter } from "nodemailer";
import ejs from "ejs";
import path from "path";
import config from "../config";

interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

const sendMail = async (options: EmailOptions): Promise<void> => {
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(config.SMTP_PORT || "587"),
    service: config.SMTP_SERVICE,
    auth: {
      user: config.SMTP_MAIL,
      pass: config.SMTP_PASSWORD,
    },
  });
  const { email, subject, template, data } = options;

  // get the path to the email template file
  const templatePath = path.join(__dirname, "../mails", template);

  // Render the email template with EJS
  const html: string = await ejs.renderFile(templatePath, data);

  const mailOptions = {
    from: config.SMTP_MAIL,
    to: email,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

export default sendMail;
