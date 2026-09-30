import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("product catalogue link overrides shared default, which covers products without a link", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "versatile-shared-catalogue-"));
  process.env.DATA_FILE = join(directory, "store.json");
  process.env.SHARED_CATALOGUE_URL = "https://example.com/shared-brochure.pdf";
  await writeFile(process.env.DATA_FILE, JSON.stringify({
    admin: null,
    categories: [{ id: "category-1", name: "Spectroscopy", slug: "spectroscopy" }],
    products: [
      { id: "a".repeat(24), name: "Instrument A", slug: "instrument-a", categoryId: "category-1", catalogueUrl: "https://example.com/old-a.pdf", status: "published" },
      { id: "b".repeat(24), name: "Instrument B", slug: "instrument-b", categoryId: "category-1", catalogueUrl: "", status: "published" },
    ],
    quotations: [], contacts: [],
  }));
  const { default: app } = await import("../src/app.js");
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    delete process.env.SHARED_CATALOGUE_URL;
    await rm(directory, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${server.address().port}/api`;

  const listing = await fetch(`${base}/public/products`).then((response) => response.json());
  assert.deepEqual(listing.products.map((product) => product.catalogueUrl), [
    "https://example.com/old-a.pdf",
    "https://example.com/shared-brochure.pdf",
  ]);
  const detail = await fetch(`${base}/public/products/instrument-a`).then((response) => response.json());
  assert.equal(detail.product.catalogueUrl, "https://example.com/old-a.pdf");

  const defaultDetail = await fetch(`${base}/public/products/instrument-b`).then((response) => response.json());
  assert.equal(defaultDetail.product.catalogueUrl, "https://example.com/shared-brochure.pdf");

  process.env.SHARED_CATALOGUE_URL = "http://example.com/not-secure.pdf";
  const fallback = await fetch(`${base}/public/products/instrument-a`).then((response) => response.json());
  assert.equal(fallback.product.catalogueUrl, "https://example.com/old-a.pdf");
});
