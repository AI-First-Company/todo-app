import nodemailer from "nodemailer";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface ReminderEmailParams {
  to: string;
  todoTitle: string;
  dueDate: string;
  reminderType: string;
}

export async function sendReminderEmail({
  to,
  todoTitle,
  dueDate,
  reminderType,
}: ReminderEmailParams) {
  const label =
    reminderType === "1_hour_before"
      ? "1 hour"
      : reminderType === "1_day_before"
        ? "1 day"
        : reminderType === "3_days_before"
          ? "3 days"
          : reminderType;

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "Todo App <noreply@todoapp.com>",
    to,
    subject: `Reminder: "${todoTitle}" is due in ${label}`,
    html: '<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;"><h2 style="color: #4f46e5;">Todo Reminder</h2><p>Your task <strong>"' + escapeHtml(todoTitle) + '"</strong> is due in <strong>' + escapeHtml(label) + '</strong>.</p><p style="color: #6b7280;">Due date: ' + escapeHtml(dueDate) + '</p><hr style="border: none; border-top: 1px solid #e5e7eb;" /><p style="color: #9ca3af; font-size: 12px;">You received this because you have email notifications enabled in your Todo App settings.</p></div>',
  });
}
