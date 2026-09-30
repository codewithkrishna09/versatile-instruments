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
import { createReceipt } from "./mail-template.js";

let transport;
const outbox =
  process.env.MAIL_QUEUE_DIRECTORY ||
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
      } catch {
        console.error("Email delivery deferred; saved job will retry.");
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
  if (!host || !from) return null;

  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;
  if (Boolean(user) !== Boolean(pass)) return null;
  return {
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
      "Set SMTP_HOST and MAIL_FROM, plus both SMTP_USER/SMTP_PASS when authentication is required.",
    );
  await getTransport(config).verify();
}

export async function sendCustomerReceipt(item, sender) {
  const config = settings();
  if (!config) return;
  const mailer = sender || getTransport(config);
  const receipt = createReceipt(item);
  await mailer.sendMail({ from: config.from, to: item.email, ...receipt,
    attachments: [{ filename: "versatile-logo.png", path: resolve(dirname(fileURLToPath(import.meta.url)), "../assets/versatile-mail-logo.png"), cid: "versatile-logo" }],
  });
}
