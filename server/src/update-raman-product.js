// Owner-supplied Raman content; update the existing record without changing its URL.
import { readFile, writeFile, rename, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const file = fileURLToPath(new URL("../data/store.json", import.meta.url));
const raw = await readFile(file, "utf8");
const data = JSON.parse(raw);
const product = data.products.find(
  (item) => item.id === "beca2bee39d25b408d1010c9",
);
if (!product)
  throw new Error("Existing Raman product not found; no changes saved.");
await access(
  fileURLToPath(
    new URL("../../client/public/images/product-raman.webp", import.meta.url),
  ),
);
Object.assign(product, {
  name: "Versatile Scientific (Raman Spectrometer)",
  overview:
    "A molecular characterisation platform for non-destructive analysis of chemical composition, molecular structure and material properties, with multiple laser excitation options and optional microscope integration.",
  description:
    "The Versatile Scientific Raman Spectrometer is an advanced molecular characterization platform engineered for non-destructive analysis of chemical composition, molecular structure, and material properties. Raman spectroscopy provides a molecular fingerprint of a sample, making the system suitable for identification and characterization without extensive sample preparation.\n\nThe instrument supports multiple laser excitation wavelengths and configurable optical arrangements, allowing analysis of a broad range of solids, powders, liquids, polymers, pharmaceuticals, pigments, semiconductors, minerals, coatings, and advanced materials. Its high-sensitivity detector and optimized optical system provide reliable spectral acquisition with excellent signal quality.\n\nAdvanced software enables spectral acquisition, baseline correction, peak analysis, spectral comparison, library searching, material identification, quantitative analysis, and report generation. Optional microscope integration and precision sample positioning further support micro-area and localized Raman measurements.\n\nThe Versatile Scientific Raman Spectrometer is suitable for pharmaceutical, chemical, materials science, semiconductor, forensic, environmental, geological, academic, research, and industrial quality-control laboratories.",
  imageUrl: "/images/product-raman.webp",
  images: ["/images/product-raman.webp"],
  features: [
    "High-Sensitivity Raman Detection – Enables reliable identification of molecular fingerprints and weak Raman signals.",
    "Multiple Laser Excitation Options – Provides flexible wavelength selection for different sample types and fluorescence conditions.",
  ],
  specifications: [
    { label: "Instrument Type", value: "Raman Spectrometer" },
    { label: "Measurement Principle", value: "Raman Scattering Spectroscopy" },
    {
      label: "Laser Power Control",
      value: "Computer-Controlled Variable Output",
    },
    { label: "Detector", value: "Thermoelectrically Cooled CCD" },
    {
      label: "Optical Configuration",
      value: "Confocal / Microscope-Coupled Optical System",
    },
  ],
  updatedAt: new Date().toISOString(),
});
if ((await readFile(file, "utf8")) !== raw)
  throw new Error(
    "Catalogue changed during update; retry after admin edits finish.",
  );
await writeFile(`${file}.before-raman.bak`, raw, { flag: "wx" }).catch(
  (error) => {
    if (error.code !== "EEXIST") throw error;
  },
);
await writeFile(`${file}.raman.tmp`, JSON.stringify(data, null, 2) + "\n");
await rename(`${file}.raman.tmp`, file);
console.log(
  JSON.stringify({
    name: product.name,
    features: product.features.length,
    specifications: product.specifications.length,
    image: product.imageUrl,
    totalProducts: data.products.length,
  }),
);
