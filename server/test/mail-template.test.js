import test from "node:test";
import assert from "node:assert/strict";
import { createReceipt } from "../src/mail-template.js";

test("product receipt includes product and safe reference, without team copy", () => {
  const result = createReceipt({ kind: "quotations", name: "Test <Lab>", productName: "Raman & FTIR", id: "abc123" });
  assert.match(result.text, /Product: Raman & FTIR/);
  assert.match(result.html, /Test &lt;Lab&gt;/);
  assert.match(result.html, /Raman &amp; FTIR/);
  assert.doesNotMatch(result.html, /Test <Lab>/);
  assert.match(result.html, /cid:versatile-logo/);
  assert.match(result.html, /bgcolor="#f5f3ee"/);
  assert.match(result.html, /alt="Versatile Instruments logo"/);
  assert.match(result.html, /tel:\+919559454555/);
  assert.match(result.html, /mailto:versatileinstru@gmail\.com/);
  assert.match(result.html, /Patel Nagar South, New Delhi, Central Delhi, Delhi 110008/);
  assert.match(result.text, /Phone: \+91 95594 54555/);
  assert.match(result.text, /Email: versatileinstru@gmail\.com/);
});

test("contact receipt excludes product section", () => {
  const result = createReceipt({ kind: "contacts", name: "Test", id: "ref1" });
  assert.doesNotMatch(result.html, /<span[^>]*>PRODUCT<\/span>/);
  assert.match(result.text, /Thank you for contacting us/);
  assert.match(result.html, /Patel Nagar South, New Delhi, Central Delhi, Delhi 110008/);
});
