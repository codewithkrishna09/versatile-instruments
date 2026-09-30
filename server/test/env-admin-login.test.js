import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("env admin ID replaces stored login without changing saved admin data", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "vi-env-admin-"));
  const previous = {
    dataFile: process.env.DATA_FILE,
    email: process.env.ADMIN_LOGIN_EMAIL,
    password: process.env.ADMIN_LOGIN_PASSWORD,
    legacy: process.env.ADMIN_ALLOW_LEGACY_LOGIN,
  };
  process.env.DATA_FILE = join(directory, "store.json");
  delete process.env.ADMIN_LOGIN_EMAIL;
  delete process.env.ADMIN_LOGIN_PASSWORD;
  delete process.env.ADMIN_ALLOW_LEGACY_LOGIN;
  const { default: app } = await import("../src/app.js");
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    for (const [key, value] of Object.entries({
      DATA_FILE: previous.dataFile,
      ADMIN_LOGIN_EMAIL: previous.email,
      ADMIN_LOGIN_PASSWORD: previous.password,
      ADMIN_ALLOW_LEGACY_LOGIN: previous.legacy,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await rm(directory, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const send = (path, email, password) => fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  assert.equal((await send("/auth/setup", "old@example.com", "old-password-123")).status, 201);
  assert.equal((await send("/auth/login", "old@example.com", "old-password-123")).status, 200);

  process.env.ADMIN_LOGIN_EMAIL = "admin@versatile.in";
  process.env.ADMIN_LOGIN_PASSWORD = "new-long-password-123";
  assert.equal((await send("/auth/login", "admin@versatile.in", "new-long-password-123")).status, 200);
  assert.equal((await send("/auth/login", "admin@versatile.in", "wrong-password")).status, 401);
  assert.equal((await send("/auth/login", "old@example.com", "old-password-123")).status, 401);

  process.env.ADMIN_LOGIN_PASSWORD = "";
  assert.equal((await send("/auth/login", "old@example.com", "old-password-123")).status, 200);
});
