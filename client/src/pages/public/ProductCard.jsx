import { useState } from "react";
import { Arrow } from "./HomePage.jsx";

export function ProductImage({ product, className = "", eager = false }) {
  const [failed, setFailed] = useState(false);
  return <div className={`catalogue-product-image ${className}`}>
    {product.imageUrl && !failed
      ? <img src={product.imageUrl} alt={product.name} loading={eager ? "eager" : "lazy"} onError={() => setFailed(true)} />
      : <div className="catalogue-image-fallback" aria-label="Product image unavailable"><span>VI / INSTRUMENT</span><strong>Image coming soon</strong></div>}
  </div>;
}

export default function ProductCard({ product }) {
  return <article className="catalogue-card">
    <a className="catalogue-card-media" href={`/products/${product.slug}`} aria-label={`View ${product.name}`}><ProductImage product={product} /></a>
    <div className="catalogue-card-body"><div className="catalogue-card-meta"><span>{product.category?.name || "Instrument"}</span>{product.sku && <span>{product.sku}</span>}</div><h3><a href={`/products/${product.slug}`}>{product.name}</a></h3>{product.overview && <p>{product.overview}</p>}<a className="catalogue-card-link" href={`/products/${product.slug}`}>Explore instrument <Arrow diagonal /></a></div>
  </article>;
}
