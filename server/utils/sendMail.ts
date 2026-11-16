import { Resend } from "resend";
import ejs from "ejs";
import path from "path";
import config from "../config";

const resend = new Resend(config.RESEND_API_KEY);

interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

const sendMail = async (options: EmailOptions): Promise<void> => {
  const { email, subject, template, data } = options;

  // Get the path to the email template
  const templatePath = path.join(__dirname, "../mails", template);

  // Render with EJS
  const html: string = await ejs.renderFile(templatePath, data);

  // Send with Resend
  await resend.emails.send({
    from: "Skoob Invoice <onboarding@resend.dev>",
    to: email,
    subject,
    html,
  });
};

export default sendMail;

// import { Resend } from "resend";
// import ejs from "ejs";
// import path from "path";
// import config from "../config";

// const resend = new Resend(config.RESEND_API_KEY);

// // Until you verify a domain in Resend, only "onboarding@resend.dev" works and
// // it can only deliver to your own Resend account email. After verifying a
// // domain, set MAIL_FROM, e.g. "Skoob Invoice <no-reply@yourdomain.com>".
// const DEFAULT_FROM = "Skoob Invoice <onboarding@resend.dev>";
// const FROM_ADDRESS = (config as any).MAIL_FROM || DEFAULT_FROM;

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
//   const { data: result, error } = await resend.emails.send({
//     from: FROM_ADDRESS,
//     to: email,
//     subject,
//     html,
//   });

//   // Resend does NOT throw on failure — it returns { error }. Throw so callers
//   // (and the frontend) know the email was not sent.
//   if (error) {
//     console.error("Resend failed to send email:", error);
//     throw new Error(error.message || "Email provider rejected the message");
//   }

//   if (config.NODE_ENV !== "production") {
//     console.log(`Email "${subject}" queued for ${email} (id: ${result?.id})`);
//   }
// };

// export default sendMail;