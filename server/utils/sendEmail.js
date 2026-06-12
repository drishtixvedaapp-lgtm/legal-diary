const nodemailer = require("nodemailer");

// ─── Transporter ──────────────────────────────────────────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// ─── Escape HTML ──────────────────────────────────────────────────────────────
const e = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  navy: "#0f2744", navyLight: "#1a3a5c",
  blue: "#1d4ed8", blueMid: "#2563eb",
  gold: "#b45309", goldLight: "#fef3c7",
  green: "#15803d", greenLight: "#dcfce7",
  slate50: "#f8fafc", slate100: "#f1f5f9",
  slate200: "#e2e8f0", slate400: "#94a3b8",
  slate500: "#64748b", slate700: "#334155",
  slate800: "#1e293b", slate900: "#0f172a",
  white: "#ffffff",
};

// ─── Base layout wrapper ──────────────────────────────────────────────────────
const layout = (accentColor, headerIcon, headerTitle, headerSub, body) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${T.slate100};font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${T.slate100};padding:40px 16px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0"
    style="max-width:600px;width:100%;background:${T.white};border-radius:16px;
           overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">
    <tr><td style="background:linear-gradient(90deg,${accentColor} 0%,${T.blueMid} 100%);height:5px;font-size:0;">&nbsp;</td></tr>
    <tr>
      <td style="background:linear-gradient(135deg,${T.navy} 0%,${T.navyLight} 60%,#1e4976 100%);padding:32px 40px 28px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:middle;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:14px;">
                    <div style="width:48px;height:48px;border-radius:12px;background:rgba(255,255,255,0.12);
                                border:1px solid rgba(255,255,255,0.18);text-align:center;line-height:48px;font-size:24px;">
                      ${headerIcon}
                    </div>
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.55);">Legal Diary</p>
                    <h1 style="margin:3px 0 0;font-size:20px;font-weight:700;color:${T.white};letter-spacing:-0.3px;line-height:1.2;">${e(headerTitle)}</h1>
                  </td>
                </tr>
              </table>
            </td>
            <td align="right" style="vertical-align:middle;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.4);">Case Management System</p>
            </td>
          </tr>
        </table>
        ${headerSub ? `<p style="margin:16px 0 0;font-size:14px;color:rgba(255,255,255,0.7);line-height:1.6;border-top:1px solid rgba(255,255,255,0.12);padding-top:16px;">${e(headerSub)}</p>` : ""}
      </td>
    </tr>
    ${body}
    <tr>
      <td style="background:${T.slate50};border-top:1px solid ${T.slate200};padding:20px 40px;text-align:center;">
        <p style="margin:0 0 6px;font-size:12px;color:${T.slate400};">This is an automated notification from <strong style="color:${T.slate500};">Legal Diary</strong>.</p>
        <p style="margin:0;font-size:11px;color:${T.slate400};">Please do not reply to this email. Contact your lawyer directly for queries.</p>
      </td>
    </tr>
    <tr><td style="background:linear-gradient(90deg,${accentColor} 0%,${T.blueMid} 100%);height:3px;font-size:0;">&nbsp;</td></tr>
  </table>
  </td></tr>
</table>
</body></html>`;

// ─── Reusable sub-components ──────────────────────────────────────────────────
const greeting = (name) => `
<tr><td style="padding:32px 40px 0;">
  <p style="margin:0;font-size:15px;color:${T.slate700};">Dear <strong style="color:${T.slate900};">${e(name)},</strong></p>
</td></tr>`;

const introPara = (text) => `
<tr><td style="padding:14px 40px 0;">
  <p style="margin:0;font-size:14px;color:${T.slate700};line-height:1.7;">${e(text)}</p>
</td></tr>`;

const sectionHeading = (title, icon) => `
<tr><td style="padding:28px 40px 10px;">
  <table cellpadding="0" cellspacing="0">
    <tr>
      <td style="font-size:16px;padding-right:8px;vertical-align:middle;">${icon}</td>
      <td style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${T.slate500};vertical-align:middle;">${e(title)}</td>
    </tr>
  </table>
  <div style="height:1px;background:${T.slate200};margin-top:8px;"></div>
</td></tr>`;

const detailsCard = (rows) => {
  const rowsHtml = rows
    .filter(([, val]) => val !== null && val !== undefined && val !== "")
    .map(([key, val, highlight], i) => `
    <tr style="background:${i % 2 === 0 ? T.slate50 : T.white};">
      <td style="padding:10px 16px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${T.slate500};width:38%;border-right:1px solid ${T.slate200};">${e(key)}</td>
      <td style="padding:10px 16px;font-size:13px;color:${highlight || T.slate800};font-weight:${highlight ? "600" : "400"};">${e(val)}</td>
    </tr>`).join("");
  return `
<tr><td style="padding:0 40px;">
  <table width="100%" cellpadding="0" cellspacing="0"
    style="border:1px solid ${T.slate200};border-radius:10px;overflow:hidden;border-collapse:separate;">
    ${rowsHtml}
  </table>
</td></tr>`;
};

const banner = (text, bgColor, borderColor, textColor, icon) => `
<tr><td style="padding:20px 40px 0;">
  <table width="100%" cellpadding="0" cellspacing="0"
    style="background:${bgColor};border-left:4px solid ${borderColor};border-radius:0 8px 8px 0;padding:14px 18px;">
    <tr>
      <td style="font-size:18px;padding-right:12px;vertical-align:top;">${icon}</td>
      <td style="font-size:13px;color:${textColor};line-height:1.6;">${e(text)}</td>
    </tr>
  </table>
</td></tr>`;

const lawyerCard = (name, phone) => `
<tr><td style="padding:20px 40px 0;">
  <table width="100%" cellpadding="0" cellspacing="0"
    style="background:linear-gradient(135deg,${T.navy},${T.navyLight});border-radius:10px;padding:18px 22px;">
    <tr>
      <td style="vertical-align:middle;padding-right:14px;">
        <div style="width:40px;height:40px;background:rgba(255,255,255,0.12);border-radius:50%;text-align:center;line-height:40px;font-size:18px;">👨‍⚖️</div>
      </td>
      <td style="vertical-align:middle;">
        <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Your Lawyer</p>
        <p style="margin:2px 0 0;font-size:14px;font-weight:700;color:${T.white};">${e(name)}</p>
        ${phone ? `<p style="margin:2px 0 0;font-size:12px;color:rgba(255,255,255,0.65);">📞 ${e(phone)}</p>` : ""}
      </td>
    </tr>
  </table>
</td></tr>`;

const spacer = (px) => `<tr><td style="height:${px}px;font-size:0;">&nbsp;</td></tr>`;

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

const newCaseEmail = ({ clientName, caseTitle, caseNumber, courtName, date, time, lawyerName, lawyerPhone }) =>
  layout(T.blueMid, "⚖️", "New Hearing Scheduled", null,
    `<table width="100%" cellpadding="0" cellspacing="0">
      ${greeting(clientName)}
      ${introPara("A new case has been filed on your behalf and your first hearing has been scheduled. Please review the details below and be present at the court on the scheduled date.")}
      ${sectionHeading("Case Details", "📁")}
      ${detailsCard([["Case Title", caseTitle], ["Case Number", caseNumber], ["Court", courtName], ["Hearing Date", date, T.blueMid], ["Hearing Time", time]])}
      ${lawyerCard(lawyerName, lawyerPhone)}
      ${banner("Please ensure you carry all relevant documents to court. Arrive at least 15 minutes before the scheduled time.", T.goldLight, T.gold, T.gold, "💡")}
      ${spacer(32)}
    </table>`);

const hearingUpdatedEmail = ({ clientName, caseTitle, caseNumber, courtName, date, time, lawyerName, lawyerPhone }) =>
  layout("#7c3aed", "📅", "Hearing Date Updated", null,
    `<table width="100%" cellpadding="0" cellspacing="0">
      ${greeting(clientName)}
      ${introPara("Your hearing date has been updated by your lawyer. Please note the new schedule carefully and disregard any previous dates.")}
      ${sectionHeading("Updated Hearing Details", "📅")}
      ${detailsCard([["Case Title", caseTitle], ["Case Number", caseNumber], ["Court", courtName], ["New Hearing Date", date, "#7c3aed"], ["Hearing Time", time]])}
      ${lawyerCard(lawyerName, lawyerPhone)}
      ${banner("This date has been officially updated. Please update your personal calendar and make necessary arrangements.", "#ede9fe", "#7c3aed", "#5b21b6", "🔔")}
      ${spacer(32)}
    </table>`);

const eveningReminderEmail = ({ clientName, caseTitle, caseNumber, courtName, date, time, lawyerName, lawyerPhone }) =>
  layout(T.gold, "🌙", "Hearing Tomorrow — Be Prepared", null,
    `<table width="100%" cellpadding="0" cellspacing="0">
      ${greeting(clientName)}
      ${introPara("This is a reminder that your court hearing is scheduled for TOMORROW. Please make all necessary arrangements today.")}
      ${sectionHeading("Tomorrow's Hearing", "📋")}
      ${detailsCard([["Case Title", caseTitle], ["Case Number", caseNumber], ["Court", courtName], ["Hearing Date", date, T.gold], ["Hearing Time", time]])}
      ${lawyerCard(lawyerName, lawyerPhone)}
      ${banner("Checklist for tomorrow: ✔ Carry all case documents  ✔ Dress formally  ✔ Arrive 15 minutes early  ✔ Keep your lawyer's number handy", T.goldLight, T.gold, T.gold, "📌")}
      ${spacer(32)}
    </table>`);

const morningReminderEmail = ({ clientName, caseTitle, caseNumber, courtName, date, time, lawyerName, lawyerPhone }) =>
  layout(T.green, "🌅", "Your Hearing Is Today", null,
    `<table width="100%" cellpadding="0" cellspacing="0">
      ${greeting(clientName)}
      ${introPara("Good morning! Your court hearing is scheduled for TODAY. Please get ready and head to the court on time.")}
      ${sectionHeading("Today's Hearing", "⚖️")}
      ${detailsCard([["Case Title", caseTitle], ["Case Number", caseNumber], ["Court", courtName], ["Hearing Date", date, T.green], ["Hearing Time", time]])}
      ${lawyerCard(lawyerName, lawyerPhone)}
      ${banner("Your hearing is TODAY. Please be at the court well before the scheduled time. Carry all required documents and stay calm.", T.greenLight, T.green, T.green, "✅")}
      ${spacer(32)}
    </table>`);

const hearingOutcomeEmail = ({ clientName, caseTitle, caseNumber, courtName, hearingDate, outcome, judgeRemarks, nextHearing, lawyerName, lawyerPhone }) => {
  const isClosed   = outcome === "Case Disposed";
  const isJudgment = outcome === "Judgment Delivered";
  const accent     = isClosed ? T.green : isJudgment ? T.gold : T.blueMid;
  const icon       = isClosed ? "✅" : isJudgment ? "⚖️" : "📋";
  const title      = isClosed ? "Case Officially Closed" : isJudgment ? "Judgment Delivered" : "Hearing Outcome Update";
  const introText  = isClosed
    ? "Your case has been disposed and officially closed. Thank you for your patience throughout the legal process."
    : isJudgment
    ? "The judgment has been delivered for your case. Please review the details and contact your lawyer for further guidance."
    : `Your hearing has been completed and the outcome recorded by your lawyer.`;

  const rows = [
    ["Case Title", caseTitle], ["Case Number", caseNumber], ["Court", courtName],
    ["Hearing Date", hearingDate], ["Outcome", outcome, accent],
  ];
  if (judgeRemarks) rows.push(["Judge Remarks", judgeRemarks]);
  if (nextHearing)  rows.push(["Next Hearing", nextHearing, T.blueMid]);
  if (!nextHearing && !isClosed) rows.push(["Next Hearing", "To be scheduled"]);

  const alertText   = isClosed ? "This case is now closed. Contact your lawyer if you have questions."
                    : nextHearing ? "Your next hearing has been scheduled. You will receive a reminder closer to the date."
                    : "Your lawyer will inform you of the next steps.";
  const alertBg     = isClosed ? T.greenLight : T.goldLight;
  const alertBorder = isClosed ? T.green : T.gold;
  const alertColor  = isClosed ? T.green : T.gold;
  const alertIcon   = isClosed ? "🎉" : "📌";

  return layout(accent, icon, title, null,
    `<table width="100%" cellpadding="0" cellspacing="0">
      ${greeting(clientName)}
      ${introPara(introText)}
      ${sectionHeading("Outcome Details", icon)}
      ${detailsCard(rows)}
      ${lawyerCard(lawyerName, lawyerPhone)}
      ${banner(alertText, alertBg, alertBorder, alertColor, alertIcon)}
      ${spacer(32)}
    </table>`);
};

// ─── OTP Email ────────────────────────────────────────────────────────────────
const buildOtpEmail = ({ name, otp, purpose }) => {
  const isLogin  = purpose === "login";
  const accent   = isLogin ? T.blueMid : T.green;
  const icon     = isLogin ? "🔐" : "✅";
  const title    = isLogin ? "Login Verification" : "Verify Your Account";
  const introText = isLogin
    ? "You requested to log in to your Legal Diary account. Use the OTP below to complete your login."
    : "Thank you for registering on Legal Diary. Use the OTP below to verify your email address.";

  return layout(accent, icon, title, null,
    `<table width="100%" cellpadding="0" cellspacing="0">
      ${greeting(name)}
      ${introPara(introText)}
      <tr><td style="padding:28px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center">
            <div style="display:inline-block;background:${T.slate100};border:2px dashed ${T.slate200};
                        border-radius:16px;padding:24px 48px;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.12em;
                         text-transform:uppercase;color:${T.slate500};">Your One-Time Password</p>
              <p style="margin:0;font-size:40px;font-weight:800;letter-spacing:0.3em;
                         color:${T.navy};font-family:'Courier New',monospace;">${e(otp)}</p>
              <p style="margin:10px 0 0;font-size:12px;color:${T.slate400};">Expires in 10 minutes</p>
            </div>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:0 40px 32px;">
        <p style="margin:0;font-size:13px;color:${T.slate400};line-height:1.6;">
          If you did not request this, please ignore this email. Do not share this OTP with anyone.
        </p>
      </td></tr>
    </table>`);
};

// ─── Main sendEmail function ──────────────────────────────────────────────────
const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from : `"Legal Diary" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html : html || `<pre style="font-family:sans-serif;">${e(text)}</pre>`,
    });
    console.log(`📧 Email sent → ${to} | "${subject}"`);
  } catch (error) {
    console.error("❌ Email Error:", error.message);
    // Non-throwing — email failure never crashes the API
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  sendEmail,
  buildOtpEmail,
  newCaseEmail,
  hearingUpdatedEmail,
  eveningReminderEmail,
  morningReminderEmail,
  hearingOutcomeEmail,
};
