import React, { lazy, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
const App = lazy(() => import("./App.jsx"));
import HomePage from "./pages/public/HomePage.jsx";
import OpeningAnimation from "./OpeningAnimation.jsx";
import AboutPage from "./pages/public/AboutPage.jsx";
import SolutionsPage from "./pages/public/SolutionsPage.jsx";
import ContactPage from "./pages/public/ContactPage.jsx";
import ProductsPage from "./pages/public/ProductsPage.jsx";
import ProductDetailPage from "./pages/public/ProductDetailPage.jsx";
import PrivacyPolicyPage from "./pages/public/PrivacyPolicyPage.jsx";
import "./styles/global.css";
import "./styles/public.css";

const isAdminRoute = window.location.pathname.startsWith("/admin");
function PublicRouter() {
  const [location, setLocation] = useState(() => window.location.href);
  useEffect(() => {
    const update = () => setLocation(window.location.href);
    function navigate(event) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = event.target.closest?.("a[href]");
      if (
        !link ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self")
      )
        return;
      const url = new URL(link.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        !/^\/(?:about\/?|solutions\/?|contact\/?|privacy-policy\/?|products(?:\/[^/]+)?\/?|)$/.test(
          url.pathname,
        )
      )
        return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash
      )
        return;
      event.preventDefault();
      if (url.href === window.location.href) return;
      window.history.pushState(null, "", url);
      update();
    }
    document.addEventListener("click", navigate);
    window.addEventListener("popstate", update);
    return () => {
      document.removeEventListener("click", navigate);
      window.removeEventListener("popstate", update);
    };
  }, []);
  useEffect(() => {
    const url = new URL(location);
    const frame = requestAnimationFrame(() => {
      const target = url.hash
        ? document.getElementById(decodeURIComponent(url.hash.slice(1)))
        : null;
      if (target) target.scrollIntoView({ behavior: "auto" });
      else window.scrollTo({ top: 0, behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [location]);
  const url = new URL(location);
  const pathname = url.pathname.replace(/\/$/, "");
  const publicPage =
    pathname === "/about" ? (
      <AboutPage />
    ) : pathname === "/solutions" ? (
      <SolutionsPage />
    ) : pathname === "/contact" ? (
      <ContactPage />
    ) : pathname === "/privacy-policy" ? (
      <PrivacyPolicyPage />
    ) : pathname === "/products" ? (
      <ProductsPage />
    ) : pathname.startsWith("/products/") ? (
      <ProductDetailPage
        key={pathname}
        slug={decodeURIComponent(pathname.slice("/products/".length))}
      />
    ) : (
      <HomePage />
    );
  return (
    <React.Fragment key={pathname + url.search}>{publicPage}</React.Fragment>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <OpeningAnimation>
      {isAdminRoute ? (
        <Suspense fallback={null}>
          <App />
        </Suspense>
      ) : (
        <PublicRouter />
      )}
    </OpeningAnimation>
  </React.StrictMode>,
);
