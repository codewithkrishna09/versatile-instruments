// Runs on demand in the browser. No generated PDFs are uploaded or persisted.
async function imageData(url) {
  if (!url) return null;
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Image timeout")), 8000);
    image.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    image.onerror = () => {
      clearTimeout(timer);
      reject(new Error("Image unavailable"));
    };
    image.src = url;
  });
  const canvas = document.createElement("canvas");
  const scale = Math.min(1, 1200 / image.naturalWidth);
  canvas.width = image.naturalWidth * scale;
  canvas.height = image.naturalHeight * scale;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return {
    data: canvas.toDataURL("image/jpeg", 0.88),
    ratio: canvas.width / canvas.height,
  };
}

export async function createProductBrochure(product, { download = true } = {}) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const [logo, photo] = await Promise.all([
    imageData("/images/versatile-mark.webp").catch(() => null),
    imageData(product.imageUrl || product.images?.[0]).catch(() => null),
  ]);
  let y = 42;
  const plain = (value) =>
    String(value || "")
      .replace(/<[^>]*>/g, "")
      .replace(/[–—]/g, "-")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/μ/g, "µ")
      .replace(/•/g, "-");
  function header() {
    pdf.setFillColor(28, 46, 49);
    pdf.rect(0, 0, 210, 29, "F");
    if (logo) pdf.addImage(logo.data, "JPEG", 16, 5, 18, 18 / logo.ratio);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255);
    pdf.setFontSize(13);
    pdf.text("VERSATILE INSTRUMENTS", logo ? 40 : 18, 14);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text("PRODUCT BROCHURE", logo ? 40 : 18, 21);
    pdf.setTextColor(28, 46, 49);
  }
  function room(height) {
    if (y + height > 263) {
      pdf.addPage();
      header();
      y = 42;
    }
  }
  function text(value, size = 10, bold = false) {
    if (!String(value || "").trim()) return;
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(plain(value), 174);
    for (const line of lines) {
      room(size * 0.48);
      pdf.text(line, 18, y);
      y += size * 0.48;
    }
    y += 4;
  }
  function heading(value) {
    room(18);
    y += 5;
    pdf.setTextColor(167, 105, 73);
    text(value, 13, true);
    pdf.setTextColor(28, 46, 49);
  }
  header();
  text(product.category?.name, 9);
  text(product.name, 21, true);
  if (product.sku) text(`Model / SKU: ${product.sku}`, 10, true);
  if (photo) {
    const height = Math.min(80, 174 / photo.ratio);
    const width = height * photo.ratio;
    room(height + 6);
    pdf.addImage(photo.data, "JPEG", (210 - width) / 2, y, width, height);
    y += height + 8;
  }
  text(product.overview);
  if (product.description) {
    heading("About the instrument");
    text(product.description);
  }
  if (product.features?.length) {
    heading("Key features");
    product.features.forEach((feature) => text(`- ${feature}`));
  }
  if (product.specifications?.length) {
    heading("Technical specifications");
    product.specifications.forEach((row) => {
      if (row.label && row.value) {
        text(row.label, 10, true);
        text(row.value);
      }
    });
  }
  heading("Enquiries & contact");
  text("+91 9559454555 | contact@versatileinstruments.com");
  text(
    "H. No. 2753, 3rd Floor, Street No. 13, Ranjit Nagar, Patel Nagar South, New Delhi, Central Delhi, Delhi 110008",
    9,
  );
  text(
    "Confirm application-specific configuration and requirements with the team before ordering.",
    9,
  );
  const total = pdf.getNumberOfPages();
  for (let page = 1; page <= total; page++) {
    pdf.setPage(page);
    pdf.setDrawColor(216, 217, 209);
    pdf.line(18, 277, 192, 277);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(95, 107, 105);
    pdf.text("Versatile Instruments | Product information", 18, 284);
    pdf.text(`${page} / ${total}`, 192, 284, { align: "right" });
  }
  pdf.setProperties({
    title: `${product.name} - Brochure`,
    author: "Versatile Instruments",
  });
  if (download)
    pdf.save(
      `${
        plain(product.name)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "product"
      }-brochure.pdf`,
    );
  return pdf;
}
