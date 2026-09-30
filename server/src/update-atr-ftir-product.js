// Apply owner-supplied ATR-FTIR details to the existing incomplete FTIR record.
import { readFile, writeFile, rename, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const file = fileURLToPath(new URL("../data/store.json", import.meta.url));
const raw = await readFile(file, "utf8");
const data = JSON.parse(raw);
const product = data.products.find(
  (item) => item.id === "a4bf78412a0a559b38cab78a",
);
if (!product)
  throw new Error("Existing FTIR product not found; no changes saved.");
await access(
  fileURLToPath(
    new URL(
      "../../client/public/images/product-atr-ftir.webp",
      import.meta.url,
    ),
  ),
);
Object.assign(product, {
  name: "Versatile Scientific (ATR-FTIR Spectrometer)",
  overview:
    "An FTIR molecular analysis platform with integrated Diamond ATR sampling for rapid qualitative and quantitative characterisation of solids, liquids, powders, gels, films and pastes with minimal preparation.",
  description:
    "The Versatile Scientific ATR-FTIR Spectrometer is an advanced molecular analysis platform engineered for rapid qualitative and quantitative characterization of a wide variety of materials. Based on Fourier Transform Infrared (FTIR) spectroscopy, the system provides detailed information about molecular bonds, functional groups, and chemical composition.\n\nIts integrated Diamond ATR sampling system enables direct analysis of solids, liquids, powders, gels, films, pastes, and other samples with minimal preparation. The robust optical configuration, high-stability interferometer, and sensitive detector provide excellent spectral quality, measurement repeatability, and long-term analytical stability.\n\nThe instrument incorporates intelligent functions for automatic background correction, atmospheric compensation, spectral processing, peak identification, library searching, and report generation, helping users obtain reliable analytical results efficiently.\n\nThe Versatile Scientific ATR-FTIR Spectrometer is suitable for pharmaceutical, chemical, polymer, food, environmental, forensic, petrochemical, academic, research, and industrial quality-control laboratories.",
  imageUrl: "/images/product-atr-ftir.webp",
  images: ["/images/product-atr-ftir.webp"],
  features: [
    "FTIR spectroscopy for qualitative and quantitative molecular characterisation.",
    "Integrated Diamond ATR sampling for direct analysis with minimal sample preparation.",
    "Supports solids, liquids, powders, gels, films and pastes.",
    "High-stability interferometer and sensitive detector for spectral quality and measurement repeatability.",
    "Automatic background correction and atmospheric compensation.",
    "Spectral processing, peak identification, library searching and report generation.",
  ],
  specifications: [
    { label: "Instrument Type", value: "ATR-FTIR Spectrometer" },
    {
      label: "Measurement Principle",
      value: "Fourier Transform Infrared Spectroscopy",
    },
    { label: "ATR Crystal", value: "Diamond ATR" },
    { label: "Interferometer", value: "High-Stability Michelson Type" },
  ],
  updatedAt: new Date().toISOString(),
});
// Keep the existing slug so already-shared product links continue working.
if ((await readFile(file, "utf8")) !== raw)
  throw new Error(
    "Catalogue changed during update; retry after admin edits finish.",
  );
await writeFile(`${file}.before-atr-ftir.bak`, raw, { flag: "wx" }).catch(
  (error) => {
    if (error.code !== "EEXIST") throw error;
  },
);
await writeFile(`${file}.atr-ftir.tmp`, JSON.stringify(data, null, 2) + "\n");
await rename(`${file}.atr-ftir.tmp`, file);
console.log(
  JSON.stringify({
    name: product.name,
    features: product.features.length,
    specifications: product.specifications.length,
    image: product.imageUrl,
    totalProducts: data.products.length,
  }),
);
