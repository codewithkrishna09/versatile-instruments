import nodemailer from "nodemailer";
import {
  mkdir,
  writeFile,
  readFile,
  readdir,
  unlink,
  rename,
} from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createReceipt, INLINE_LOGO_CID } from "./mail-template.js";

let transport;
const persistentDataDirectory = process.env.PERSISTENT_DATA_DIRECTORY?.trim();
const outbox =
  process.env.MAIL_QUEUE_DIRECTORY ||
  (persistentDataDirectory &&
    resolve(persistentDataDirectory, "mail-outbox")) ||
  resolve(dirname(fileURLToPath(import.meta.url)), "../data/mail-outbox");
let processing = false;
let retryTimer;

// Customer receipts survive restarts. SMTP acceptance followed by a crash can
// cause one duplicate, while the authoritative enquiry stays in admin.
export async function queueCustomerReceipt(item, { schedule = true } = {}) {
  if (!settings()) return;
  await mkdir(outbox, { recursive: true });
  const filename = resolve(outbox, `${item.id}.json`);
  await writeFile(`${filename}.tmp`, JSON.stringify(item), { mode: 0o600 });
  await rename(`${filename}.tmp`, filename);
  if (schedule) setImmediate(processMailOutbox);
}

export async function processMailOutbox(sender) {
  if (processing || !settings()) return;
  processing = true;
  try {
    const files = await readdir(outbox).catch((error) => {
      if (error.code === "ENOENT") return [];
      throw error;
    });
    for (const file of files.filter((name) =>
      /^[a-f0-9]{24}\.json$/.test(name),
    )) {
      const filename = resolve(outbox, file);
      try {
        await sendCustomerReceipt(
          JSON.parse(await readFile(filename, "utf8")),
          sender,
        );
        await unlink(filename);
      } catch (error) {
        // Log status/category only; provider messages can contain customer data.
        console.error("Email delivery deferred; saved job will retry.", {
          provider: settings()?.provider,
          status: error.status || null,
          code: /^[a-zA-Z0-9_]+$/.test(error.code || "")
            ? error.code
            : "delivery_failed",
        });
      }
    }
  } catch {
    console.error("Email outbox unavailable; enquiries remain in admin.");
  } finally {
    processing = false;
    clearTimeout(retryTimer);
    retryTimer = setTimeout(processMailOutbox, 60000);
    retryTimer.unref();
  }
}

function settings() {
  const host = process.env.SMTP_HOST?.trim();
  const from = process.env.MAIL_FROM?.trim();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey && from) return { provider: "resend", apiKey, from };
  if (!host || !from) return null;

  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  if (Boolean(user) !== Boolean(pass)) return null;
  return {
    provider: "smtp",
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    from,
    user,
    pass,
  };
}

function getTransport(config) {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      ...(config.user && config.pass
        ? { auth: { user: config.user, pass: config.pass } }
        : {}),
      connectionTimeout: 6000,
      socketTimeout: 8000,
    });
  }
  return transport;
}

export async function verifyMailConnection() {
  const config = settings();
  if (!config)
    throw new Error(
      "Set MAIL_FROM and RESEND_API_KEY, or configure SMTP_HOST and SMTP credentials.",
    );
  if (config.provider === "resend") {
    // Sending-only keys cannot list domains. Do not send mail as a config check.
    if (!config.apiKey.startsWith("re_"))
      throw new Error("Invalid RESEND_API_KEY format.");
    return "Resend configuration present. Authentication and delivery require a test enquiry; check Resend Emails for its result.";
  }
  await getTransport(config).verify();
  return "SMTP connection and authentication succeeded. Confirm sender approval with your mail provider before going live.";
}

export async function sendCustomerReceipt(item, sender) {
  const config = settings();
  if (!config) return;
  const receipt = createReceipt(item);
  if (config.provider === "resend") {
    const logo = await readFile(
      resolve(
        dirname(fileURLToPath(import.meta.url)),
        "../assets/versatile-mail-logo.png",
      ),
    );
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `customer-receipt/${item.id}`,
      },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        from: config.from,
        to: [item.email],
        ...receipt,
        attachments: [
          {
            filename: "versatile-logo.png",
            content: logo.toString("base64"),
            content_type: "image/png",
            content_id: INLINE_LOGO_CID,
            content_disposition: "inline",
          },
        ],
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.id) {
      const error = new Error(
        `Resend delivery failed (HTTP ${response.status}).`,
      );
      error.status = response.status;
      error.code =
        typeof result.name === "string" ? result.name : "invalid_response";
      throw error;
    }
    return;
  }
  const mailer = sender || getTransport(config);
  await mailer.sendMail({
    from: config.from,
    to: item.email,
    ...receipt,
    attachments: [
      {
        filename: "versatile-logo.png",
        path: resolve(
          dirname(fileURLToPath(import.meta.url)),
          "../assets/versatile-mail-logo.png",
        ),
        cid: INLINE_LOGO_CID,
      },
    ],
  });
}
