import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("Resend HTTPS receipts preserve failures, retry with the same key, and include the logo", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "vi-resend-test-"));
  const previous = { ...process.env };
  t.after(async () => {
    for (const key of ["MAIL_QUEUE_DIRECTORY", "RESEND_API_KEY", "MAIL_FROM", "SMTP_HOST"]) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
    await rm(directory, { recursive: true, force: true });
  });
  process.env.MAIL_QUEUE_DIRECTORY = directory;
  process.env.RESEND_API_KEY = "re_test_fake_key";
  process.env.MAIL_FROM = "Versatile Instruments <no-reply@example.com>";
  process.env.SMTP_HOST = "must-not-be-used.example.com";
  const requests = [];
  let status = 403;
  t.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url, options });
    return new Response(JSON.stringify(status === 200 ? { id: "provider-id" } : { name: "validation_error" }), { status });
  });
  const { queueCustomerReceipt, processMailOutbox, verifyMailConnection } = await import("../src/mail.js");
  assert.match(await verifyMailConnection(), /require a test enquiry/);
  assert.equal(requests.length, 0);
  await queueCustomerReceipt({ id: "b".repeat(24), kind: "quotations", name: "Test", email: "visitor@example.com", productName: "Raman" }, { schedule: false });
  await processMailOutbox();
  assert.equal((await readdir(directory)).length, 1);
  status = 200;
  await processMailOutbox();
  assert.equal((await readdir(directory)).length, 0);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].url, "https://api.resend.com/emails");
  assert.equal(requests[0].options.headers["Idempotency-Key"], requests[1].options.headers["Idempotency-Key"]);
  const payload = JSON.parse(requests[1].options.body);
  assert.deepEqual(payload.to, ["visitor@example.com"]);
  assert.equal(payload.cc, undefined);
  assert.equal(payload.bcc, undefined);
  assert.match(payload.text, /Product: Raman/);
  assert.match(payload.html, /cid:versatile-logo/);
  assert.equal(payload.attachments[0].content_id, "versatile-logo");
  assert.equal(Buffer.from(payload.attachments[0].content, "base64").subarray(1, 4).toString(), "PNG");
});
