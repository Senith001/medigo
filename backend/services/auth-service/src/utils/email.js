import "dotenv/config";
import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // false for 2525 and 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export const sendOtpEmail = async (to, subject, otp) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: `
      <h2>MEDIGO OTP</h2>
      <p>Your OTP code is:</p>
      <h1>${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    `
  });
};

export const sendSimpleEmail = async (to, subject, message) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: `<p>${message}</p>`
  });
};

export const sendAdminInvitationEmail = async (to, fullName, setupLink) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "You've been invited to join MediGo as an Admin",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #1a1a1a; margin-bottom: 8px;">Welcome to MediGo, ${fullName}!</h2>
        <p style="color: #475569;">You have been invited by a Super Admin to join the MediGo platform as an administrator.</p>
        <p style="color: #475569;">Click the button below to set up your password and activate your account. This link will expire in <strong>24 hours</strong>.</p>
        <a href="${setupLink}" style="display: inline-block; margin: 24px 0; padding: 12px 28px; background-color: #1a1a1a; color: #ffffff; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Activate My Account
        </a>
        <p style="color: #94a3b8; font-size: 0.85rem;">If you did not expect this invitation, you can safely ignore this email.</p>
      </div>
    `
  });
};