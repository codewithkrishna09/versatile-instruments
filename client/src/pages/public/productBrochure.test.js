import test from "node:test";
import assert from "node:assert/strict";
import { createProductBrochure } from "./productBrochure.js";

test("minimal future products get a branded PDF without requiring an image", async () => {
  const pdf = await createProductBrochure(
    { name: "Versatile Test Instrument" },
    { download: false },
  );
  const output = pdf.output();
  assert.ok(output.startsWith("%PDF-"));
  assert.ok(output.includes("Versatile Test Instrument"));
  assert.ok(output.includes("VERSATILE INSTRUMENTS"));
  assert.ok(output.includes("contact@versatileinstruments.com"));
  assert.ok(!output.includes("Technical specifications"));
});

test("long product data paginates and includes supplied features/specifications", async () => {
  const pdf = await createProductBrochure(
    {
      name: "Versatile Raman Spectrometer",
      sku: "VI-100",
      description: "Sample information. ".repeat(1000),
      features: ["Supplied feature"],
      specifications: [{ label: "Detector", value: "Cooled CCD" }],
      imageUrl: "/missing-image.webp",
    },
    { download: false },
  );
  assert.ok(pdf.getNumberOfPages() > 1);
  const output = pdf.output();
  assert.ok(output.includes("Supplied feature"));
  assert.ok(output.includes("Cooled CCD"));
  assert.ok(output.includes("Model / SKU: VI-100"));
});
