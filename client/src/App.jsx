import { useEffect, useState } from "react";
import { api } from "./services/api";
import {
  Dashboard,
  Categories,
  Products,
  ProductEditor,
  Inbox,
} from "./pages/admin/AdminPages";

const paths = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  categories: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  products: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9" />
    </>
  ),
  quotations: <path d="M4 5h16v11H9l-5 4V5Z" />,
  contacts: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 5 5" />
    </>
  ),
  edit: (
    <>
      <path d="m4 20 4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z" />
      <path d="m14 7 3 3" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7M10 11v6m4-6v6" />
    </>
  ),
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  back: <path d="m15 18-6-6 6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M5 5l14 14M19 5 5 19" />,
  logout: (
    <>
      <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M16 8l4 4-4 4M8 12h12" />
    </>
  ),
};
export function Icon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
export function PageHead({ kicker, title, description, action }) {
  return (
    <div className="page-head">
      <div>
        <div className="eyebrow">{kicker}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="page-action">{action}</div>}
    </div>
  );
}
export function Empty({ icon, title, detail, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon name={icon} size={25} />
      </div>
      <h3>{title}</h3>
      <p>{detail}</p>
      {action}
    </div>
  );
}
export function Modal({ title, children, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div
      className="modal-scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Auth({ setupRequired, onAuthenticated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupToken, setSetupToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (setupRequired)
        await api("/auth/setup", {
          method: "POST",
          headers: setupToken ? { "X-Setup-Token": setupToken } : {},
          body: JSON.stringify({ email, password }),
        });
      await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      onAuthenticated();
    } catch (issue) {
      setError(issue.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-mark" aria-hidden="true">
          <img
            src="/images/versatile-mark.webp"
            alt=""
            width="240"
            height="240"
          />
        </div>
        <span>
          VERSATILE
          <br />
          INSTRUMENTS
        </span>
      </div>
      <div className="auth-card">
        <div className="eyebrow">ADMINISTRATION</div>
        <h1>{setupRequired ? "Set up your workspace" : "Welcome back"}</h1>
        <p>
          {setupRequired
            ? "Create the first administrator account."
            : "Sign in to manage your catalogue and enquiries."}
        </p>
        <form onSubmit={submit}>
          <label>
            {setupRequired ? "Email address" : "Admin ID"}
            <input
              type={setupRequired ? "email" : "text"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              placeholder={
                setupRequired ? "name@company.com" : "Enter your admin ID"
              }
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={setupRequired ? "new-password" : "current-password"}
              minLength={setupRequired ? 12 : undefined}
              required
              placeholder={
                setupRequired ? "Minimum 12 characters" : "Enter your password"
              }
            />
          </label>
          {setupRequired && (
            <label>
              Server setup token{" "}
              <input
                type="password"
                value={setupToken}
                onChange={(event) => setSetupToken(event.target.value)}
                autoComplete="off"
                placeholder="Required for first setup in production"
              />
            </label>
          )}
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <button className="btn btn-primary btn-full-width" disabled={busy}>
            {busy
              ? "Please wait…"
              : setupRequired
                ? "Create account"
                : "Sign in"}{" "}
            <Icon name="arrow" size={17} />
          </button>
        </form>
      </div>
      <small>Versatile Instruments · Admin workspace</small>
    </div>
  );
}

const sections = [
  { id: "overview", label: "Overview" },
  { id: "categories", label: "Categories" },
  { id: "products", label: "Products" },
  { id: "quotations", label: "Quotations" },
  { id: "contacts", label: "Messages" },
];
export default function App() {
  const [auth, setAuth] = useState(null);
  const [section, setSection] = useState("overview");
  const [data, setData] = useState({
    categories: [],
    products: [],
    quotations: [],
    contacts: [],
    overview: null,
    catalogueConfig: { sharedCatalogueUrl: "" },
  });
  const [error, setError] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [editing, setEditing] = useState(null);
  useEffect(() => {
    api("/auth/status")
      .then(setAuth)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (auth?.authenticated) refresh();
  }, [auth?.authenticated]);
  async function refresh() {
    // Load all sections together so dashboard counts and lists reflect the same refresh.
    try {
      const [
        overview,
        categories,
        products,
        quotations,
        contacts,
        catalogueConfig,
      ] = await Promise.all(
        [
          "overview",
          "categories",
          "products",
          "quotations",
          "contacts",
          "catalogue-config",
        ].map((name) => api(`/admin/${name}`)),
      );
      setData({
        overview,
        categories,
        products,
        quotations,
        contacts,
        catalogueConfig,
      });
    } catch (issue) {
      setError(issue.message);
      if (issue.message === "Sign in required.")
        setAuth({ authenticated: false, setupRequired: false });
    }
  }
  async function mutate(path, options) {
    // Every successful write updates the visible lists and dashboard totals.
    const result = await api(path, options);
    await refresh();
    return result;
  }
  function navigate(next) {
    setSection(next);
    setEditing(null);
    setMobileNav(false);
    window.scrollTo(0, 0);
  }
  async function logout() {
    await api("/auth/logout", { method: "POST" });
    setAuth({ authenticated: false, setupRequired: false });
  }
  if (!auth)
    return <div className="screen-loader">{error || "Loading workspace…"}</div>;
  if (!auth.authenticated)
    return (
      <Auth
        setupRequired={auth.setupRequired}
        onAuthenticated={() =>
          setAuth({ authenticated: true, setupRequired: false })
        }
      />
    );
  const title = editing
    ? editing.id
      ? "Edit product"
      : "New product"
    : sections.find((item) => item.id === section)?.label;
  return (
    <div className="admin-shell">
      <aside className={`sidebar ${mobileNav ? "is-open" : ""}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true">
              <img
                src="/images/versatile-mark.webp"
                alt=""
                width="240"
                height="240"
              />
            </div>
            <div className="brand-name">
              VERSATILE<span>INSTRUMENTS</span>
            </div>
          </div>
          <button
            className="mobile-close icon-button"
            onClick={() => setMobileNav(false)}
            aria-label="Close menu"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav aria-label="Admin navigation">
          {sections.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${section === item.id && !editing ? "active" : ""}`}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.id} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-support">
            <span className="status-dot" /> Admin workspace
          </div>
          <button className="nav-item sign-out-link" onClick={logout}>
            <Icon name="logout" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation"
        />
      )}
      <div className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            onClick={() => setMobileNav(true)}
            aria-label="Open menu"
          >
            <Icon name="menu" />
          </button>
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{title}</strong>
          </div>
          <div className="topbar-right">
            <span className="topbar-date">
              {new Intl.DateTimeFormat("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }).format(new Date())}
            </span>
            <span className="avatar">VI</span>
          </div>
        </header>
        <main className="admin-content">
          <div className="admin-content-inner">
            {error && (
              <div className="banner-error" role="alert">
                {error}
                <button onClick={() => setError("")} aria-label="Dismiss">
                  ×
                </button>
              </div>
            )}
            {editing ? (
              <ProductEditor
                item={editing}
                categories={data.categories}
                sharedCatalogueUrl={data.catalogueConfig.sharedCatalogueUrl}
                onBack={() => setEditing(null)}
                onOpenCategories={() => navigate("categories")}
                onSave={async (payload) => {
                  await mutate(
                    `/admin/products${editing.id ? `/${editing.id}` : ""}`,
                    {
                      method: editing.id ? "PUT" : "POST",
                      body: JSON.stringify(payload),
                    },
                  );
                  setEditing(null);
                }}
              />
            ) : section === "overview" ? (
              <Dashboard data={data} navigate={navigate} />
            ) : section === "categories" ? (
              <Categories items={data.categories} mutate={mutate} />
            ) : section === "products" ? (
              <Products
                items={data.products}
                categories={data.categories}
                mutate={mutate}
                onEdit={setEditing}
              />
            ) : (
              <Inbox type={section} items={data[section]} mutate={mutate} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
