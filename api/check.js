const axios = require("axios");
const nodemailer = require("nodemailer");

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

async function handler(req, res) {
  try {
    const CRON_SECRET = mustEnv("CRON_SECRET");

    const tokenFromQuery = req.query?.token;
    const tokenFromHeader = req.headers?.["x-cron-secret"];
    const token = tokenFromQuery || tokenFromHeader;

    // if (token !== CRON_SECRET) {
    //   return res.status(401).json({ ok: false, error: "Unauthorized" });
    // }

    const API_URL = mustEnv("API_URL");
    const MATCH_STRING = mustEnv("MATCH_STRING");

    const SMTP_HOST = mustEnv("SMTP_HOST");
    const SMTP_PORT = Number(mustEnv("SMTP_PORT"));
    const SMTP_SECURE = String(mustEnv("SMTP_SECURE")) === "true";
    const SMTP_USER = mustEnv("SMTP_USER");
    const SMTP_PASS = mustEnv("SMTP_PASS");
    const MAIL_TO = mustEnv("MAIL_TO");
    const MAIL_TO2 = mustEnv("MAIL_TO2");
    const MAIL_FROM = mustEnv("MAIL_FROM");
    const BODY = mustEnv("API_BODY");
    const r = await axios.post(API_URL, BODY);
    if (r.status != 200) {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      await transporter.sendMail({
        from: MAIL_FROM,
        to: MAIL_TO,
        subject: `KHÔNG GỌI ĐƯỢC API, VÀO CHECK HỘ CÁI`,
        text: `KHÔNG GỌI ĐƯỢC API, VÀO CHECK HỘ CÁI`,
      });

      emailed = true;
    }
    const bodyText =
      typeof r.data === "string" ? r.data : JSON.stringify(r.data);
    const matched = bodyText.toUpperCase().includes(MATCH_STRING.toUpperCase());

    let emailed = false;

    if (matched) {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      await transporter.sendMail({
        from: MAIL_FROM,
        to: MAIL_TO,
        subject: `CÓ BÀI VIẾT CÓ CHỨA "${MATCH_STRING}"`,
        text: `CÓ BÀI VIẾT CÓ CHỨA "${MATCH_STRING}"`,
      });

      await transporter.sendMail({
        from: MAIL_FROM,
        to: MAIL_TO2,
        subject: `CÓ BÀI VIẾT CÓ CHỨA "${MATCH_STRING}"`,
        text: `CÓ BÀI VIẾT CÓ CHỨA "${MATCH_STRING}"`,
      });

      emailed = true;
    }

    return res.status(200).json({
      ok: true,
      matched,
      emailed,
      status: r.status,
      checkedAt: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}

module.exports = { handler };
