import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { Arrow, Footer, Header } from "./HomePage.jsx";
import ProductCard from "./ProductCard.jsx";
import { paginationItems } from "./pagination.js";
import "../../styles/products.css";

export default function ProductsPage() {
  const initialCategory = new URLSearchParams(window.location.search).get("category") || "";
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [catalogue, setCatalogue] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Keep category selections shareable without adding search text to browser history.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (category) url.searchParams.set("category", category);
    else url.searchParams.delete("category");
    window.history.replaceState(null, "", url);
  }, [category]);

  useEffect(() => {
    const timeout = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 280);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    setLoading(true);
    setError("");
    api(`/public/products?${params}`)
      .then((result) => { if (active) setCatalogue(result); })
      .catch((issue) => { if (active) setError(issue.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, category, page, retry]);

  function chooseCategory(value) { setCategory(value); setPage(1); }
  function resetFilters() { setSearchInput(""); setSearch(""); setCategory(""); setPage(1); }
  function changePage(nextPage) {
    setPage(nextPage);
    document.getElementById("catalogue-results")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  return <div className="public-site catalogue-page" id="top"><Header /><main>
    <section className="catalogue-hero catalogue-photo-hero" aria-labelledby="catalogue-title"><picture className="catalogue-hero-photo"><source media="(max-width: 760px)" srcSet="/images/products-hero-mobile.webp" /><img src="/images/products-hero.webp" alt="" width="1672" height="941" fetchPriority="high" /></picture><div className="catalogue-wrap"><span className="catalogue-kicker">THE INSTRUMENT CATALOGUE / VERSATILE</span><h1 id="catalogue-title">Explore the instruments behind the work<span>.</span></h1><p>Find equipment by discipline, search a model, and review the details that matter before making an enquiry.</p><a className="catalogue-hero-browse" href="#catalogue-results">Browse instruments <Arrow diagonal /></a><div className="catalogue-hero-line"><span>PRODUCTS / DISCOVER</span><span>ILLUSTRATIVE LABORATORY</span></div></div></section>
    <section className="catalogue-content catalogue-wrap" aria-label="Product catalogue">
      <div className="catalogue-results" id="catalogue-results"><div className="catalogue-controls"><div><span className="catalogue-kicker">BROWSE / SELECT / ENQUIRE</span><h2>{catalogue?.categories.find((item) => item.slug === category)?.name || "All instruments"}</h2><p>Find an instrument by application, category or model.</p></div><label className="catalogue-search"><span className="sr-only">Search products</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.7"/><path d="m16 16 5 5"/></svg><input type="search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search name, model or application" /></label></div>
        <div className="catalogue-category-filters" role="group" aria-label="Filter instruments by category"><button type="button" className={!category ? "is-active" : ""} aria-pressed={!category} onClick={() => chooseCategory("")}>All instruments <span>{catalogue?.totalPublished ?? "—"}</span></button>{catalogue?.categories.filter((item) => item.productCount > 0).map((item) => <button key={item.id} type="button" className={category === item.slug ? "is-active" : ""} aria-pressed={category === item.slug} onClick={() => chooseCategory(item.slug)}>{item.name}<span>{item.productCount}</span></button>)}</div>
        <div className="catalogue-results-meta" aria-live="polite"><span>{loading ? "Loading instruments…" : error ? "Catalogue unavailable" : `${catalogue?.total ?? 0} ${catalogue?.total === 1 ? "instrument" : "instruments"} found`}</span>{(search || category) && <button type="button" onClick={resetFilters}>Clear filters ×</button>}</div>
        {error ? <div className="catalogue-empty" role="alert"><h3>We couldn’t load the catalogue.</h3><p>{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)}>Try again <Arrow /></button></div>
          : loading ? <div className="catalogue-grid catalogue-loading" aria-label="Loading products" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <div className="catalogue-skeleton" key={index}><div /><span /><span /></div>)}</div>
          : !catalogue?.products.length ? <div className="catalogue-empty"><span>NO INSTRUMENTS TO SHOW</span><h3>{search || category ? "Try a different search or category." : "The catalogue is being prepared."}</h3><p>{search || category ? "Clear your filters to see all published instruments." : "Products published from the admin workspace will appear here automatically."}</p>{(search || category) && <button type="button" onClick={resetFilters}>Show all instruments <Arrow /></button>}</div>
          : <div className={`catalogue-grid ${catalogue.products.length <= 2 ? "catalogue-grid-compact" : ""}`}>{catalogue.products.map((product) => <ProductCard product={product} key={product.id} />)}</div>}
        {!error && !loading && (catalogue?.pageCount ?? 0) > 1 && <nav className="catalogue-pagination catalogue-numbered-pagination" aria-label="Product pages"><button type="button" disabled={page === 1} onClick={() => changePage(page - 1)} aria-label="Previous page">←</button>{paginationItems(page, catalogue.pageCount).map((item) => typeof item === "number" ? <button type="button" key={item} aria-label={`Page ${item}`} aria-current={page === item ? "page" : undefined} onClick={() => changePage(item)}>{item}</button> : <span className="catalogue-page-gap" key={item} aria-hidden="true">…</span>)}<button type="button" disabled={page >= catalogue.pageCount} onClick={() => changePage(page + 1)} aria-label="Next page">→</button></nav>}
      </div></section>
  </main><Footer /></div>;
}
