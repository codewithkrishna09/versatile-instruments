// Owner-supplied product copy and image; preserve the existing record and URL.
import { readFile, writeFile, rename } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const file = fileURLToPath(new URL("../data/store.json", import.meta.url));
const raw = await readFile(file, "utf8");
const data = JSON.parse(raw);
const product = data.products.find(
  (item) => item.id === "616c171da335078c14d20782",
);
if (!product) throw new Error("Existing fluorescence product not found.");
Object.assign(product, {
  name: "Versatile Scientific (Fluorescence Spectrophotometer)",
  overview:
    "An optical spectroscopy system for sensitive fluorescence and photoluminescence analysis, with excitation and emission wavelength selection, a xenon light source, dual monochromators and photomultiplier detection.",
  description:
    "The Versatile Scientific Fluorescence Spectrophotometer is a high-performance optical spectroscopy system engineered for sensitive fluorescence and photoluminescence analysis of a wide variety of samples. The instrument provides precise excitation and emission wavelength selection for studying fluorescent compounds, molecular interactions, biological materials, and advanced functional materials.\n\nIts advanced optical configuration combines a high-intensity xenon light source, dual monochromator arrangement, and sensitive photomultiplier detection system to provide excellent spectral quality and low-level signal detection. Flexible measurement modes allow users to perform excitation and emission scans, synchronous measurements, time-dependent fluorescence studies, and quantitative analysis.\n\nThe system incorporates intelligent software for instrument control, spectral acquisition, data processing, peak analysis, spectral comparison, kinetic measurements, and professional report generation. Programmable measurement parameters allow users to optimize experiments for different sample types and analytical requirements.\n\nThe Versatile Scientific Fluorescence Spectrophotometer is suitable for pharmaceutical, biotechnology, chemical, environmental, food, materials science, academic, research, and industrial quality-control laboratories.",
  imageUrl: "/images/product-fluorescence.webp",
  images: ["/images/product-fluorescence.webp"],
  features: [
    "Precise excitation and emission wavelength selection for fluorescence and photoluminescence analysis.",
    "High-intensity xenon light source, dual monochromators and sensitive photomultiplier detection.",
    "Excitation and emission scans, synchronous measurements and time-dependent fluorescence studies.",
    "Quantitative analysis and kinetic measurements for application-specific studies.",
    "Software for instrument control, spectral acquisition, data processing, peak analysis and spectral comparison.",
    "Programmable measurement parameters and professional report generation.",
  ],
  specifications: [
    { label: "Instrument Type", value: "Fluorescence Spectrophotometer" },
    { label: "Light Source", value: "High-Intensity Xenon Arc Lamp" },
    {
      label: "Monochromator System",
      value: "Dual Czerny-Turner Monochromator",
    },
    { label: "Detector", value: "High-Sensitivity Photomultiplier Tube (PMT)" },
  ],
  updatedAt: new Date().toISOString(),
});
if ((await readFile(file, "utf8")) !== raw)
  throw new Error("Catalogue changed; retry after admin edits finish.");
await writeFile(`${file}.before-fluorescence.bak`, raw, { flag: "wx" }).catch(
  (error) => {
    if (error.code !== "EEXIST") throw error;
  },
);
await writeFile(
  `${file}.fluorescence.tmp`,
  JSON.stringify(data, null, 2) + "\n",
);
await rename(`${file}.fluorescence.tmp`, file);
console.log(
  JSON.stringify({
    name: product.name,
    features: product.features.length,
    specifications: product.specifications.length,
    image: product.imageUrl,
    totalProducts: data.products.length,
  }),
);
