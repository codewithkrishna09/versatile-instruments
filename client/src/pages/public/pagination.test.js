import test from "node:test";
import assert from "node:assert/strict";
import { paginationItems } from "./pagination.js";

test("small catalogues show clickable page numbers", () => {
  assert.deepEqual(paginationItems(1, 0), []);
  assert.deepEqual(paginationItems(1, 3), [1, 2, 3]);
});
test("large catalogues retain first, last and neighbouring pages", () => {
  assert.deepEqual(paginationItems(1, 100), [1, 2, 3, 4, "gap-4", 100]);
  assert.deepEqual(paginationItems(50, 100), [1, "gap-1", 49, 50, 51, "gap-51", 100]);
  assert.deepEqual(paginationItems(100, 100), [1, "gap-1", 97, 98, 99, 100]);
});
test("every current page remains selectable without duplicates", () => {
  for (let count = 1; count <= 100; count++) for (let page = 1; page <= count; page++) {
    const items = paginationItems(page, count);
    assert.ok(items.includes(page));
    assert.equal(new Set(items).size, items.length);
    assert.ok(items.filter((item) => typeof item === "number").every((item) => item >= 1 && item <= count));
  }
});
