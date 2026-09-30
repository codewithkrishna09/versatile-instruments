import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("email outbox preserves failed jobs and removes delivered jobs", async () => {
  const directory = await mkdtemp(join(tmpdir(), "vi-mail-test-"));
  process.env.MAIL_QUEUE_DIRECTORY = directory;
  process.env.SMTP_HOST = "smtp.example.com";
  process.env.MAIL_FROM = "no-reply@example.com";
  const { queueCustomerReceipt, processMailOutbox } = await import("../src/mail.js");
  try {
    await queueCustomerReceipt({ id: "a".repeat(24), kind: "quotations", name: "Test", email: "visitor@example.com", productName: "Test Instrument", message: "Test enquiry" }, { schedule: false });
    await processMailOutbox({ sendMail: async () => { throw new Error("Offline"); } });
    assert.equal((await readdir(directory)).filter((name) => name.endsWith(".json")).length, 1);
    const messages = [];
    await processMailOutbox({ sendMail: async (message) => { messages.push(message); } });
    assert.equal(messages.length, 1);
    assert.equal(messages[0].to, "visitor@example.com");
    assert.match(messages[0].text, /Product: Test Instrument/);
    assert.equal((await readdir(directory)).length, 0);
  } finally {
    delete process.env.SMTP_HOST;
    delete process.env.MAIL_FROM;
    await rm(directory, { recursive: true, force: true });
  }
});
