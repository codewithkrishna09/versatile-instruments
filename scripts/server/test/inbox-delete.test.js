import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("admin can delete one quotation or message, while anonymous requests cannot", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "versatile-inbox-delete-"));
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
  const setup = await fetch(`${base}/auth/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "test-password-123" }),
  });
  assert.equal(setup.status, 201);
  const login = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "test-password-123" }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie").split(";")[0];

  const stored = JSON.parse(await readFile(process.env.DATA_FILE, "utf8"));
  stored.quotations = [{ id: "a".repeat(24), name: "Quote Visitor", status: "new" }];
  stored.contacts = [{ id: "b".repeat(24), name: "Contact Visitor", status: "closed" }];
  await writeFile(process.env.DATA_FILE, JSON.stringify(stored));

  const forbidden = await fetch(`${base}/admin/quotations/${"a".repeat(24)}`, { method: "DELETE" });
  assert.equal(forbidden.status, 401);
  assert.equal((await fetch(`${base}/admin/quotations`, { headers: { Cookie: cookie } }).then((r) => r.json())).length, 1);

  const quoteDelete = await fetch(`${base}/admin/quotations/${"a".repeat(24)}`, { method: "DELETE", headers: { Cookie: cookie } });
  assert.equal(quoteDelete.status, 204);
  const contactDelete = await fetch(`${base}/admin/contacts/${"b".repeat(24)}`, { method: "DELETE", headers: { Cookie: cookie } });
  assert.equal(contactDelete.status, 204);
  const missing = await fetch(`${base}/admin/contacts/${"b".repeat(24)}`, { method: "DELETE", headers: { Cookie: cookie } });
  assert.equal(missing.status, 404);

  const result = JSON.parse(await readFile(process.env.DATA_FILE, "utf8"));
  assert.equal(result.quotations.length, 0);
  assert.equal(result.contacts.length, 0);
});
