// One-time local catalogue migration, explicitly authorised by the site owner.
// Preserves existing IDs, links and details; never invents technical specifications.
import { readFile, writeFile, rename } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";

const file = fileURLToPath(new URL("../data/store.json", import.meta.url));
const raw = await readFile(file, "utf8");
const data = JSON.parse(raw);
const items = [
  ["Zeta Potential Analyzer", "surface-particle-analysis"],
  ["Contact Angle Meter", "surface-particle-analysis"],
  [
    "UV-Visible-NIR Spectrophotometer",
    "spectroscopy",
    "An instrument for UV, visible and near-infrared spectrophotometric analysis. Share your sample type and required wavelength range to discuss a suitable configuration.",
    "/images/product-uv-visible-nir.webp",
  ],
  [
    "FTIR Spectrometer",
    "spectroscopy",
    "Fourier-transform infrared spectroscopy for molecular characterisation. Share your sample form, preferred sampling accessory and measurement requirements to discuss the configuration.",
  ],
  [
    "Raman Spectrometer",
    "spectroscopy",
    "Raman spectroscopy for molecular and material characterisation. Discuss your sample, measurement objective and required configuration with the team.",
  ],
  [
    "Fluorescence Spectrophotometer",
    "spectroscopy",
    "An instrument for fluorescence-based sample analysis. Share your application, sample type and excitation/emission requirements to discuss the configuration.",
  ],
];
const now = new Date().toISOString();
let added = 0,
  updated = 0;
for (const [label, categorySlug, overview = "", image = ""] of items) {
  const category = data.categories.find((item) => item.slug === categorySlug);
  if (!category) throw new Error(`Missing category: ${categorySlug}`);
  const existing = data.products.find(
    (item) =>
      item.name.toLowerCase().includes(label.toLowerCase()) ||
      (label === "FTIR Spectrometer" && /NEX-FTIR-8000/i.test(item.name)),
  );
  if (existing) {
    existing.name = `Versatile Scientific (${label})`;
    existing.description = (existing.description || "").replace(
      /Nexaris Scientific/gi,
      "Versatile Scientific",
    );
    existing.overview = (existing.overview || "").replace(
      /Nexaris Scientific/gi,
      "Versatile Scientific",
    );
    existing.updatedAt = now;
    updated++;
  } else {
    const id = randomBytes(12).toString("hex");
    data.products.push({
      id,
      name: `Versatile Scientific (${label})`,
      categoryId: category.id,
      sku: "",
      overview,
      description: overview,
      catalogueUrl: "",
      imageUrl: image,
      images: image ? [image] : [],
      features: [],
      specifications: [],
      status: "published",
      featured: true,
      createdAt: now,
      updatedAt: now,
      slug: `versatile-scientific-${label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}-${id.slice(0, 8)}`,
    });
    added++;
  }
}
// Abort if anything changed since the initial read instead of overwriting an admin edit.
if ((await readFile(file, "utf8")) !== raw)
  throw new Error(
    "Catalogue changed during migration; retry after admin edits finish.",
  );
await writeFile(`${file}.before-six-products.bak`, raw, { flag: "wx" }).catch(
  (error) => {
    if (error.code !== "EEXIST") throw error;
  },
);
await writeFile(
  `${file}.six-products.tmp`,
  JSON.stringify(data, null, 2) + "\n",
);
await rename(`${file}.six-products.tmp`, file);
console.log(
  JSON.stringify(
    {
      added,
      updated,
      total: data.products.length,
      names: data.products.map((item) => item.name),
    },
    null,
    2,
  ),
);
