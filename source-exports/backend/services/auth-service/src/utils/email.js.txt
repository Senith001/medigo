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

export const sendDoctorApplicationEmail = async (to, fullName) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "MediGo — We've Received Your Application",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #1a1a1a;">Thank you for applying, Dr. ${fullName}!</h2>
        <p style="color: #475569;">We have received your registration application on the MediGo platform.</p>
        <p style="color: #475569;">Our administrative team will review your medical credentials and license number shortly. This process typically takes <strong>1–2 business days</strong>.</p>
        <p style="color: #475569;">You will receive another email once your account has been reviewed.</p>
        <p style="color: #94a3b8; font-size: 0.85rem;">If you did not submit this application, please contact us immediately.</p>
      </div>
    `
  });
};

export const sendDoctorApprovalEmail = async (to, fullName) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "MediGo — Your Account Has Been Approved! 🎉",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #166534;">Congratulations, Dr. ${fullName}!</h2>
        <p style="color: #475569;">Your MediGo doctor account has been <strong>verified and approved</strong> by our administrative team.</p>
        <p style="color: #475569;">You can now log in to the MediGo platform and start managing your patients and appointments.</p>
        <a href="http://localhost:5173/doctor-login" style="display: inline-block; margin: 24px 0; padding: 12px 28px; background-color: #166534; color: #ffffff; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Log In Now
        </a>
        <p style="color: #94a3b8; font-size: 0.85rem;">Welcome to the MediGo team!</p>
      </div>
    `
  });
};

export const sendDoctorRejectionEmail = async (to, fullName) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "MediGo — Application Status Update",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #991b1b;">Application Update, Dr. ${fullName}</h2>
        <p style="color: #475569;">After reviewing your application, we were unable to verify your medical credentials at this time.</p>
        <p style="color: #475569;">If you believe this is an error or wish to appeal this decision, please contact our support team with your medical license details.</p>
        <p style="color: #94a3b8; font-size: 0.85rem;">We appreciate your interest in joining MediGo.</p>
      </div>
    `
  });
};