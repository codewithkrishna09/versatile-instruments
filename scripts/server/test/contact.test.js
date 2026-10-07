import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sendCustomerReceipt } from "../src/mail.js";

test("configured no-reply mail acknowledges the visitor only", async () => {
  process.env.SMTP_HOST = "smtp.example.com";
  process.env.MAIL_FROM = "Versatile Instruments <no-reply@example.com>";
  const messages = [];
  const sender = { sendMail: async (message) => { messages.push(message); } };
  await sendCustomerReceipt({ id: "abc123", kind: "contacts", name: "Test Visitor", email: "visitor@example.com", message: "Instrument enquiry" }, sender);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].to, "visitor@example.com");
  assert.equal(messages[0].from, "Versatile Instruments <no-reply@example.com>");
  assert.match(messages[0].html, /cid:versatile-logo/);
  assert.match(messages[0].text, /Reference: abc123/);
  assert.equal(messages[0].attachments.length, 1);
  delete process.env.SMTP_HOST;
  delete process.env.MAIL_FROM;
});

test("contact enquiry is saved and appears in the admin inbox without SMTP", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "versatile-contact-test-"));
  process.env.DATA_FILE = join(directory, "store.json");
  delete process.env.SMTP_HOST;
  const { default: app } = await import("../src/app.js");
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await rm(directory, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${server.address().port}/api`;

  const payload = { name: "Test Visitor", email: "visitor@example.com", company: "Test Lab", message: "Enquiry type: Equipment enquiry\n\nNeed a suitable analytical instrument." };
  const sent = await fetch(`${base}/contacts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  assert.equal(sent.status, 201);
  const stored = JSON.parse(await readFile(process.env.DATA_FILE, "utf8"));
  assert.equal(stored.contacts.length, 1);
  assert.equal(stored.contacts[0].message, payload.message);

  const setup = await fetch(`${base}/auth/setup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "admin@example.com", password: "test-password-123" }) });
  assert.equal(setup.status, 201);
  const login = await fetch(`${base}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "admin@example.com", password: "test-password-123" }) });
  assert.equal(login.status, 200);
  const inbox = await fetch(`${base}/admin/contacts`, { headers: { Cookie: login.headers.get("set-cookie").split(";")[0] } });
  assert.equal(inbox.status, 200);
  assert.equal((await inbox.json())[0].email, payload.email);
});
