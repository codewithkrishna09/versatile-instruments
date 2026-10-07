import { useState } from "react";
import { Arrow } from "./HomePage.jsx";

export default function ProductBrochure({ product }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const external = /^https:\/\//i.test(product.catalogueUrl || "");
  async function download() {
    setBusy(true);
    setError("");
    try {
      const { createProductBrochure } = await import("./productBrochure.js");
      await createProductBrochure(product);
    } catch {
      setError("The brochure couldn’t be generated. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="product-catalogue-download catalogue-wrap"
      aria-labelledby="product-catalogue-title"
    >
      <div>
        <span className="catalogue-kicker">PRODUCT DOCUMENT</span>
        <h2 id="product-catalogue-title">Take the details with you.</h2>
        <p>
          Download the {external ? "catalogue" : "brochure"} for {product.name}.
        </p>
        {error && <p role="alert">{error}</p>}
      </div>
      {external ? (
        <a
          href={product.catalogueUrl}
          rel="noopener noreferrer"
          aria-label={`Download catalogue for ${product.name}`}
        >
          Download product catalogue <Arrow diagonal />
        </a>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={download}
          aria-label={`Download PDF brochure for ${product.name}`}
        >
          {busy ? "Preparing PDF…" : "Download PDF brochure"}
          <Arrow diagonal />
        </button>
      )}
    </section>
  );
}
