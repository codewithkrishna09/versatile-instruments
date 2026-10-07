import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Arrow, Footer, Header } from "./HomePage.jsx";
import ProductCard, { ProductImage } from "./ProductCard.jsx";
import "../../styles/products.css";
import ProductBrochure from "./ProductBrochure.jsx";

function ProductQuoteForm({ product }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await api("/quotations", {
        method: "POST",
        body: JSON.stringify({ ...form, productId: product.id }),
      });
      setStatus("sent");
      setForm({ name: "", email: "", company: "", phone: "", message: "" });
    } catch (issue) {
      setError(issue.message);
      setStatus("idle");
    }
  }

  if (status === "sent")
    return (
      <div className="product-quote-success" role="status">
        <span>REQUEST RECEIVED</span>
        <h3>Thank you for your enquiry.</h3>
        <p>
          Your request for {product.name} has been sent with your contact
          details.
        </p>
        <button type="button" onClick={() => setStatus("idle")}>
          Send another request <Arrow />
        </button>
      </div>
    );

  return (
    <form className="product-quote-form" onSubmit={submit}>
      <div className="product-quote-tag">
        ENQUIRY FOR <strong>{product.name}</strong>
      </div>
      <div className="product-quote-fields">
        <label>
          Full name *
          <input
            required
            autoComplete="name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Your name"
          />
        </label>
        <label>
          Work email *
          <input
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            placeholder="name@organisation.com"
          />
        </label>
        <label>
          Organisation
          <input
            autoComplete="organization"
            value={form.company}
            onChange={(event) =>
              setForm({ ...form, company: event.target.value })
            }
            placeholder="Company or institution"
          />
        </label>
        <label>
          Phone number
          <input
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) =>
              setForm({ ...form, phone: event.target.value })
            }
            placeholder="Optional"
          />
        </label>
      </div>
      <label>
        Tell us about your requirement *
        <textarea
          required
          rows="5"
          value={form.message}
          onChange={(event) =>
            setForm({ ...form, message: event.target.value })
          }
          placeholder="Application, specifications, quantity, timeline or any questions"
        />
      </label>
      {error && (
        <p className="product-form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Request a quotation"}
        <Arrow diagonal />
      </button>
    </form>
  );
}

export default function ProductDetailPage({ slug }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setData(null);
    setActiveImage(0);
    api(`/public/products/${encodeURIComponent(slug)}`)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((issue) => {
        if (active) setError(issue.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const product = data?.product;
  const images = product?.images || [];
  const hasGallery = images.length > 1;
  const specificationsIndex = product?.features?.length ? "03" : "02";
  const enquiryIndex = String(
    2 +
      Number(Boolean(product?.features?.length)) +
      Number(Boolean(product?.specifications?.length)),
  ).padStart(2, "0");
  function showImage(index) {
    setActiveImage((index + images.length) % images.length);
  }
  return (
    <div className="public-site product-detail-page" id="top">
      <Header />
      <main>
        <div className="product-detail-breadcrumb catalogue-wrap">
          <a href="/">Home</a>
          <span>/</span>
          <a href="/products">Products</a>
          {product && (
            <>
              <span>/</span>
              <span>{product.name}</span>
            </>
          )}
        </div>
        {loading ? (
          <div className="product-detail-state catalogue-wrap">
            Loading instrument…
          </div>
        ) : error || !product ? (
          <div className="product-detail-state catalogue-wrap">
            <span>PRODUCT NOT AVAILABLE</span>
            <h1>We couldn’t find this instrument.</h1>
            <p>It may have been removed or is no longer published.</p>
            <a href="/products">
              Back to products <Arrow />
            </a>
          </div>
        ) : (
          <>
            <section
              className="product-detail-hero catalogue-wrap"
              aria-labelledby="product-title"
            >
              <div className="product-detail-gallery">
                <div className="product-gallery-main">
                  <ProductImage
                    key={images[activeImage] || product.id}
                    product={{
                      ...product,
                      imageUrl: images[activeImage] || product.imageUrl,
                    }}
                    className="product-detail-image"
                    eager
                  />
                  {hasGallery && (
                    <div className="product-gallery-navigation">
                      <button
                        type="button"
                        onClick={() => showImage(activeImage - 1)}
                        aria-label="Previous product image"
                      >
                        ←
                      </button>
                      <span aria-live="polite">
                        {String(activeImage + 1).padStart(2, "0")} /{" "}
                        {String(images.length).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        onClick={() => showImage(activeImage + 1)}
                        aria-label="Next product image"
                      >
                        →
                      </button>
                    </div>
                  )}
                </div>
                {hasGallery && (
                  <div
                    className="product-gallery-thumbs"
                    aria-label="Product images"
                  >
                    {images.map((url, index) => (
                      <button
                        type="button"
                        key={`${url}-${index}`}
                        className={index === activeImage ? "is-active" : ""}
                        onClick={() => showImage(index)}
                        aria-label={`Show product image ${index + 1} of ${images.length}`}
                        aria-pressed={index === activeImage}
                      >
                        <img src={url} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="product-detail-hero-copy">
                <span className="catalogue-kicker">
                  INSTRUMENT / {product.category?.name || "EQUIPMENT"}
                </span>
                <h1 id="product-title">{product.name}</h1>
                {product.sku && (
                  <div className="product-model">MODEL / {product.sku}</div>
                )}
                <p>
                  {product.overview ||
                    "Explore the technical information below and share your application to discuss this instrument."}
                </p>
                <div className="product-detail-hero-actions">
                  <a href="#request-quote">
                    Request a quotation <Arrow diagonal />
                  </a>
                  {!!product.specifications?.length && (
                    <a href="#product-specifications">View specifications ↓</a>
                  )}
                </div>
              </div>
            </section>
            <div className="product-detail-strip">
              <div className="catalogue-wrap">
                <span>APPLICATION-LED EQUIPMENT</span>
                <span>PRODUCT DETAILS / {product.sku || "INSTRUMENT"}</span>
              </div>
            </div>
            <section
              className="product-detail-overview catalogue-wrap"
              aria-labelledby="product-overview-title"
            >
              <div>
                <span className="catalogue-kicker">01 / OVERVIEW</span>
                <h2 id="product-overview-title">The instrument at a glance.</h2>
              </div>
              <div>
                <p>
                  {product.description ||
                    product.overview ||
                    "Detailed product overview is being prepared. Review the available features and specifications below, or send us your application details."}
                </p>
                {product.category && (
                  <a
                    href={`/products?category=${encodeURIComponent(product.category.slug)}`}
                  >
                    Explore {product.category.name} <Arrow diagonal />
                  </a>
                )}
              </div>
            </section>
            {!!product.features?.length && (
              <section
                className="product-detail-features"
                aria-labelledby="product-features-title"
              >
                <div className="catalogue-wrap">
                  <div>
                    <span className="catalogue-kicker">02 / CAPABILITIES</span>
                    <h2 id="product-features-title">Key features.</h2>
                    <p>
                      Review the published capabilities against your application
                      and sample requirements.
                    </p>
                  </div>
                  <ul>
                    {product.features.map((feature, index) => (
                      <li key={`${feature}-${index}`}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <p>{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
            {!!product.specifications?.length && (
              <section
                className="product-detail-specifications catalogue-wrap"
                id="product-specifications"
                aria-labelledby="product-specifications-title"
              >
                <div>
                  <span className="catalogue-kicker">
                    {specificationsIndex} / TECHNICAL DETAILS
                  </span>
                  <h2 id="product-specifications-title">Specifications.</h2>
                  <p>
                    Review the published parameters. Confirm
                    application-specific requirements in your enquiry.
                  </p>
                </div>
                <div className="product-spec-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Parameter</th>
                        <th scope="col">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.specifications.map((row, index) => (
                        <tr key={`${row.label}-${index}`}>
                          <th scope="row">{row.label}</th>
                          <td>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
            <ProductBrochure key={product.id} product={product} />
            <section
              className="product-detail-quote"
              id="request-quote"
              aria-labelledby="product-quote-title"
            >
              <div className="catalogue-wrap">
                <div className="product-detail-quote-copy">
                  <span className="catalogue-kicker">
                    {enquiryIndex} / PRODUCT ENQUIRY
                  </span>
                  <h2 id="product-quote-title">
                    Let’s discuss your application.
                  </h2>
                  <p>
                    Tell us how you intend to use {product.name}. Include the
                    capabilities, quantity or timing that matter to your team.
                  </p>
                </div>
                <ProductQuoteForm product={product} />
              </div>
            </section>
            {!!data.related?.length && (
              <section
                className="product-related catalogue-wrap"
                aria-labelledby="related-products-title"
              >
                <div className="product-related-head">
                  <div>
                    <span className="catalogue-kicker">CONTINUE EXPLORING</span>
                    <h2 id="related-products-title">Related instruments.</h2>
                  </div>
                  <a href="/products">
                    View all products <Arrow />
                  </a>
                </div>
                <div className="catalogue-grid">
                  {data.related.map((item) => (
                    <ProductCard product={item} key={item.id} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
