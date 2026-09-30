import { useState } from "react";
import { Icon, PageHead, Empty, Modal } from "../../App";
import "../../styles/dashboard.css";
import "../../styles/categories.css";

const date = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";
const blankProduct = {
  name: "",
  categoryId: "",
  sku: "",
  overview: "",
  description: "",
  catalogueUrl: "",
  imageUrl: "",
  images: [],
  features: [""],
  specifications: [{ label: "", value: "" }],
  status: "draft",
  featured: false,
};

export function Dashboard({ data, navigate }) {
  const ready = Boolean(data.overview);
  const publishedCount = data.products.filter((item) => item.status === "published").length;
  const draftCount = data.products.length - publishedCount;
  const newQuotations = data.quotations.filter((item) => item.status === "new").length;
  const newMessages = data.contacts.filter((item) => item.status === "new").length;
  const activity = [
    ...data.quotations.map((item) => ({ ...item, kind: "quotations" })),
    ...data.contacts.map((item) => ({ ...item, kind: "contacts" })),
  ].sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt)).slice(0, 6);
  const stats = [
    { id: "products", label: "Products", note: `${publishedCount} published · ${draftCount} draft` },
    { id: "categories", label: "Categories", note: "Catalogue groups" },
    { id: "quotations", label: "Quotations", note: `${newQuotations} new request${newQuotations === 1 ? "" : "s"}` },
    { id: "contacts", label: "Messages", note: `${newMessages} new message${newMessages === 1 ? "" : "s"}` },
  ];
  return (
    <>
      <PageHead
        kicker="WORKSPACE OVERVIEW"
        title="Overview"
        description="Catalogue status and incoming enquiries in one place."
      />
      <div className="stats-grid">
        {stats.map((stat) => (
          <button
            type="button"
            key={stat.id}
            className="stat-card"
            onClick={() => navigate(stat.id)}
          >
            <div className="stat-top">
              <span>{stat.label}</span>
              <Icon name={stat.id} size={20} />
            </div>
            <div className="stat-value">{data.overview?.[stat.id] ?? "—"}</div>
            <div className="dashboard-stat-note">{ready ? stat.note : "Loading…"}</div>
            <span className="stat-link">
              View {stat.label.toLowerCase()} <Icon name="arrow" size={16} />
            </span>
          </button>
        ))}
      </div>
      <div className="dashboard-grid dashboard-overview-grid">
        <section className="panel dashboard-recent dashboard-activity" aria-labelledby="dashboard-activity-title">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">INCOMING</div>
              <h2 id="dashboard-activity-title">Recent enquiries</h2>
            </div>
            <span className="dashboard-activity-count">{ready ? `${newQuotations + newMessages} new` : "Loading…"}</span>
          </div>
          {activity.length ? (
            <div className="dashboard-activity-list">
              {activity.map((item) => (
                <button className="dashboard-activity-row" type="button" key={`${item.kind}-${item.id}`} onClick={() => navigate(item.kind)}>
                  <span className={`dashboard-activity-icon ${item.kind}`}><Icon name={item.kind} size={17} /></span>
                  <span className="dashboard-activity-main"><strong>{item.kind === "quotations" ? item.productName || "Product quotation" : item.name}</strong><small>{item.kind === "quotations" ? `Quotation · ${item.name}` : `Message · ${item.company || item.email}`}</small></span>
                  <span className="dashboard-activity-side">{item.status === "new" && <i>NEW</i>}<time dateTime={item.createdAt}>{date(item.createdAt)}</time></span>
                </button>
              ))}
            </div>
          ) : (
            <Empty
              icon="contacts"
              title={ready ? "No enquiries yet" : "Loading enquiries…"}
              detail="New contact messages and quotation requests will appear here."
            />
          )}
          <div className="dashboard-activity-footer"><button type="button" onClick={() => navigate("quotations")}>View quotations <Icon name="arrow" size={15} /></button><button type="button" onClick={() => navigate("contacts")}>View messages <Icon name="arrow" size={15} /></button></div>
        </section>
        <section className="panel dashboard-catalogue" aria-labelledby="dashboard-catalogue-title">
          <div className="eyebrow">CATALOGUE STATUS</div>
          <h2 id="dashboard-catalogue-title">What visitors can see.</h2>
          <p>Only published products appear on the public catalogue. Drafts remain in this workspace until you publish them.</p>
          <div className="dashboard-catalogue-count"><strong>{ready ? publishedCount : "—"}</strong><span>published products</span></div>
          <div className="dashboard-catalogue-bar" role="img" aria-label={`${publishedCount} of ${data.products.length} products published`}><span style={{ width: `${data.products.length ? publishedCount / data.products.length * 100 : 0}%` }} /></div>
          <div className="dashboard-catalogue-meta"><span>{ready ? `${draftCount} ${draftCount === 1 ? "draft" : "drafts"}` : "Loading…"}</span><span>{ready ? `${data.categories.length} ${data.categories.length === 1 ? "category" : "categories"}` : ""}</span></div>
          <div className="dashboard-catalogue-actions"><button type="button" onClick={() => navigate("products")}>Manage products <Icon name="arrow" size={16} /></button><a href="/products">View public catalogue <Icon name="arrow" size={16} /></a></div>
        </section>
      </div>
    </>
  );
}

function SearchBar({ value, onChange, placeholder, count }) {
  return (
    <div className="toolbar">
      <div className="search-field">
        <Icon name="search" size={18} />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </div>
      <span className="result-count">{count} total</span>
    </div>
  );
}
function RowActions({ item, onEdit, onDelete }) {
  return (
    <div className="row-actions">
      <button
        className="icon-button"
        onClick={() => onEdit(item)}
        aria-label={`Edit ${item.name}`}
        title="Edit"
      >
        <Icon name="edit" size={17} />
      </button>
      <button
        className="icon-button danger-icon"
        onClick={() => onDelete(item)}
        aria-label={`Delete ${item.name}`}
        title="Delete"
      >
        <Icon name="trash" size={17} />
      </button>
    </div>
  );
}
function DeleteModal({ item, noun, onClose, onDelete }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={`Delete ${noun}?`} onClose={() => { if (!busy) onClose(); }}>
      <div className="modal-body">
        <p className="confirm-copy">
          “{item.name}” will be permanently removed.
        </p>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                await onDelete();
                onClose();
              } catch (issue) {
                setError(issue.message);
                setBusy(false);
              }
            }}
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function Categories({ items, mutate }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const shown = items.filter((item) =>
    [item.name, item.slug, item.description].some((value) =>
      String(value || "").toLowerCase().includes(search.toLowerCase()),
    ),
  );
  return (
    <>
      <PageHead
        kicker="CATALOGUE"
        title="Categories"
        description="Organise products into clear, browsable groups."
        action={
          <button
            className="btn btn-primary"
            onClick={() => setModal({ type: "edit", item: null })}
          >
            <Icon name="plus" size={17} /> Add category
          </button>
        }
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search categories"
        count={items.length}
      />
      {modal?.type === "edit" && (
        <CategoryModal key={modal.item?.id || "new"} item={modal.item} onClose={() => setModal(null)} onSave={async (payload) => {
          await mutate(`/admin/categories${modal.item ? `/${modal.item.id}` : ""}`, { method: modal.item ? "PUT" : "POST", body: JSON.stringify(payload) });
          setModal(null);
        }} />
      )}
      {shown.length ? (
        <div className="panel table-panel category-directory">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>URL slug</th>
                  <th>Description</th>
                  <th className="table-cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="category-identity"><span className="category-thumbnail">{item.imageUrl ? <img src={item.imageUrl} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <Icon name="categories" size={22} />}</span><strong>{item.name}</strong></div>
                    </td>
                    <td>
                      <span className="text-muted">/{item.slug}</span>
                    </td>
                    <td className="description-cell">
                      {item.description || "—"}
                    </td>
                    <td className="table-cell-actions">
                      <RowActions
                        item={item}
                        onEdit={(item) => setModal({ type: "edit", item })}
                        onDelete={(item) => setModal({ type: "delete", item })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="panel">
          <Empty
            icon="categories"
            title="No categories found"
            detail="Add a category to organise the product catalogue."
            action={
              <button
                className="btn btn-primary"
                onClick={() => setModal({ type: "edit", item: null })}
              >
                Add category
              </button>
            }
          />
        </div>
      )}
      {modal?.type === "delete" && (
        <DeleteModal
          item={modal.item}
          noun="category"
          onClose={() => setModal(null)}
          onDelete={() =>
            mutate(`/admin/categories/${modal.item.id}`, { method: "DELETE" })
          }
        />
      )}
    </>
  );
}

function CategoryModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    name: item?.name || "",
    slug: item?.slug || "",
    description: item?.description || "",
    imageUrl: item?.imageUrl || "",
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(item));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  async function uploadCategoryImage(file) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Choose a JPG, PNG or WebP image smaller than 5 MB.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("image", file);
      const response = await fetch("/api/admin/upload", { method: "POST", credentials: "include", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Image upload failed.");
      setForm((previous) => ({ ...previous, imageUrl: result.url }));
    } catch (issue) { setError(issue.message); }
    finally { setUploading(false); }
  }
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave(form);
    } catch (issue) {
      setError(issue.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="category-editor panel" aria-labelledby="category-editor-title">
      <div className="category-editor-heading"><div><div className="eyebrow">CATALOGUE ORGANISATION</div><h2 id="category-editor-title">{item ? "Edit category" : "Create a category"}</h2><p>A clear name, a useful description and an optional cover image.</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close category editor"><Icon name="close" /></button></div>
      <form className="category-editor-form" onSubmit={submit}>
        <div className="category-editor-fields">
        <label>
          Category name
          <input
            autoFocus
            required
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((previous) => ({
                ...previous,
                name,
                slug: slugTouched
                  ? previous.slug
                  : name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-|-$/g, ""),
              }));
            }}
            placeholder="e.g. Laboratory equipment"
          />
        </label>
        <label>
          URL slug
          <input
            required
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm({ ...form, slug: e.target.value });
            }}
            placeholder="laboratory-equipment"
          />
        </label>
        <label>
          Description
          <textarea
            rows="3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="A short description for this category"
          />
        </label>
        </div>
        <div className="category-cover-editor"><span className="category-cover-label">Category cover <small>Optional</small></span>
          <label className="category-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (!uploading && !busy) uploadCategoryImage(event.dataTransfer.files[0]); }}>
            {form.imageUrl ? <img src={form.imageUrl} alt="Category cover preview" /> : <Icon name="categories" size={32} />}
            <strong>{uploading ? "Uploading image…" : form.imageUrl ? "Replace cover image" : "Choose a cover image"}</strong><span>Browse or drop a file · JPG, PNG, WebP · up to 5 MB</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading || busy} onChange={(event) => { uploadCategoryImage(event.target.files[0]); event.target.value = ""; }} />
          </label>
          {form.imageUrl && <button type="button" className="btn btn-secondary" disabled={uploading || busy} onClick={() => setForm({ ...form, imageUrl: "" })}>Remove cover</button>}
          <p>Use a clean instrument or application image. Categories without a cover keep a neutral icon.</p>
        </div>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy || uploading}>
            {busy ? "Saving…" : item ? "Save changes" : "Create category"}
          </button>
        </div>
      </form>
    </section>
  );
}

export function Products({ items, categories, mutate, onEdit }) {
  const [search, setSearch] = useState("");
  const [deleteItem, setDeleteItem] = useState(null);
  const shown = items.filter((item) =>
    [item.name, item.sku].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );
  return (
    <>
      <PageHead
        kicker="CATALOGUE"
        title="Products"
        description="Manage product details, specifications and visibility."
        action={
          <button
            className="btn btn-primary"
            onClick={() => onEdit({ ...blankProduct })}
          >
            <Icon name="plus" size={17} /> Add product
          </button>
        }
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search products or model number"
        count={items.length}
      />
      {shown.length ? (
        <div className="panel table-panel">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th className="table-cell-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="product-cell">
                        <div className="product-thumb">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" />
                          ) : (
                            <Icon name="products" size={21} />
                          )}
                        </div>
                        <div>
                          <strong>{item.name}</strong>
                          <small>{item.sku || "No model number"}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {categories.find(
                        (category) => category.id === item.categoryId,
                      )?.name || "—"}
                    </td>
                    <td>
                      <span className={`badge ${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-muted">{date(item.updatedAt)}</td>
                    <td className="table-cell-actions">
                      <RowActions
                        item={item}
                        onEdit={onEdit}
                        onDelete={setDeleteItem}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="panel">
          <Empty
            icon="products"
            title="No products found"
            detail="Add a product to start building your catalogue."
            action={
              <button
                className="btn btn-primary"
                onClick={() => onEdit({ ...blankProduct })}
              >
                Add product
              </button>
            }
          />
        </div>
      )}
      {deleteItem && (
        <DeleteModal
          item={deleteItem}
          noun="product"
          onClose={() => setDeleteItem(null)}
          onDelete={() =>
            mutate(`/admin/products/${deleteItem.id}`, { method: "DELETE" })
          }
        />
      )}
    </>
  );
}

export function ProductEditor({
  item,
  categories,
  sharedCatalogueUrl = "",
  onBack,
  onOpenCategories,
  onSave,
}) {
  // Copy list fields so editing never mutates the product shown elsewhere in the UI.
  const [form, setForm] = useState({
    ...blankProduct,
    ...item,
    images: item.images?.length
      ? [...item.images]
      : item.imageUrl
        ? [item.imageUrl]
        : [],
    features: item.features?.length ? [...item.features] : [""],
    specifications: item.specifications?.length
      ? item.specifications.map((row) => ({ ...row }))
      : [{ label: "", value: "" }],
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [catalogueInput, setCatalogueInput] = useState(
    item.catalogueUrl || sharedCatalogueUrl || "",
  );
  function field(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }
  function feature(index, value) {
    field(
      "features",
      form.features.map((row, i) => (i === index ? value : row)),
    );
  }
  function specification(index, key, value) {
    field(
      "specifications",
      form.specifications.map((row, i) =>
        i === index ? { ...row, [key]: value } : row,
      ),
    );
  }
  async function submit(event) {
    event.preventDefault();
    if (form.catalogueUrl && !/^https:\/\//i.test(form.catalogueUrl.trim())) {
      setError("Enter a secure HTTPS catalogue link.");
      window.scrollTo(0, 0);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onSave(form);
    } catch (issue) {
      setError(issue.message);
      window.scrollTo(0, 0);
    } finally {
      setBusy(false);
    }
  }
  async function uploadImage(event) {
    // Upload each selected file through the existing endpoint; the first is the card cover.
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (files.length + form.images.length > 8) {
      setError("You can upload up to 8 images per product.");
      event.target.value = "";
      return;
    }
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const body = new FormData();
        body.append("image", file);
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          credentials: "include",
          body,
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "Image upload failed.");
        setForm((previous) => {
          const images = [...previous.images, result.url];
          return { ...previous, images, imageUrl: images[0] || "" };
        });
      }
    } catch (issue) {
      setError(issue.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }
  function changeImages(images) {
    setForm((previous) => ({ ...previous, images, imageUrl: images[0] || "" }));
  }
  return (
    <>
      <div className="editor-header">
        <button className="back-button" onClick={onBack}>
          <Icon name="back" size={18} /> Products
        </button>
        <div className="editor-actions">
          <button className="btn btn-secondary" type="button" onClick={onBack}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            form="product-form"
            disabled={busy || uploading}
          >
            {busy ? "Saving…" : uploading ? "Uploading…" : "Save product"}
          </button>
        </div>
      </div>
      <PageHead
        kicker="CATALOGUE / PRODUCTS"
        title={item.id ? "Edit product" : "New product"}
        description="Keep product information concise and accurate."
      />
      {error && (
        <div className="banner-error" role="alert">
          {error}
        </div>
      )}
      {!categories.length && (
        <div className="editor-prerequisite" role="status">
          <div>
            <strong>Create a category first</strong>
            <p>
              Every product needs a category before it can be saved or
              published.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenCategories}
          >
            Manage categories
          </button>
        </div>
      )}
      <form id="product-form" onSubmit={submit} className="editor-grid">
        <div className="editor-main">
          <section className="panel form-panel">
            <div className="section-heading">
              <span className="section-number">01</span>
              <div>
                <h2>Basic information</h2>
                <p>Name, category and product overview</p>
              </div>
            </div>
            <div className="form-grid">
              <label className="span-2">
                <span>
                  Product name <em>*</em>
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => field("name", e.target.value)}
                  placeholder="Enter product name"
                />
              </label>
              <label>
                Model / SKU
                <input
                  value={form.sku}
                  onChange={(e) => field("sku", e.target.value)}
                  placeholder="e.g. VI-100"
                />
              </label>
              <label>
                <span>
                  Category <em>*</em>
                </span>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => field("categoryId", e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <section className="span-2 catalogue-link-panel catalogue-link-inline">
                <label htmlFor="product-catalogue-url">
                  Catalogue PDF link{" "}
                  <span className="optional-label">Optional</span>
                </label>
                <input
                  id="product-catalogue-url"
                  type="url"
                  inputMode="url"
                  pattern="https://.*"
                  value={catalogueInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCatalogueInput(value);
                    field("catalogueUrl", value === sharedCatalogueUrl ? "" : value);
                  }}
                  onFocus={(e) => {
                    if (!form.catalogueUrl && sharedCatalogueUrl) e.target.select();
                  }}
                  placeholder="Paste a public HTTPS PDF link"
                />
              </section>
              <label className="span-2">
                Short overview
                <textarea
                  rows="3"
                  value={form.overview}
                  onChange={(e) => field("overview", e.target.value)}
                  placeholder="A concise summary for the product introduction"
                />
              </label>
              <label className="span-2">
                Detailed description
                <textarea
                  rows="10"
                  value={form.description || ""}
                  onChange={(e) => field("description", e.target.value)}
                  placeholder="Explain the measurement method, applications and practical capabilities"
                />
              </label>
            </div>
          </section>
          <section className="panel form-panel">
            <div className="section-heading">
              <span className="section-number">02</span>
              <div>
                <h2>Key features</h2>
                <p>One feature per row</p>
              </div>
            </div>
            <div className="dynamic-list">
              {form.features.map((row, index) => (
                <div className="dynamic-row" key={index}>
                  <input
                    aria-label={`Feature ${index + 1}`}
                    value={row}
                    onChange={(e) => feature(index, e.target.value)}
                    placeholder="Describe a product feature"
                  />
                  <button
                    type="button"
                    className="icon-button danger-icon"
                    aria-label={`Remove feature ${index + 1}`}
                    onClick={() =>
                      field(
                        "features",
                        form.features.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Icon name="trash" size={17} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-line"
              onClick={() => field("features", [...form.features, ""])}
            >
              <Icon name="plus" size={17} /> Add feature
            </button>
          </section>
          <section className="panel form-panel">
            <div className="section-heading">
              <span className="section-number">03</span>
              <div>
                <h2>Specifications</h2>
                <p>Technical details shown as a table</p>
              </div>
            </div>
            <div className="dynamic-list">
              {form.specifications.map((row, index) => (
                <div className="dynamic-row spec-row" key={index}>
                  <input
                    aria-label={`Specification ${index + 1} name`}
                    value={row.label}
                    onChange={(e) =>
                      specification(index, "label", e.target.value)
                    }
                    placeholder="Parameter"
                  />
                  <input
                    aria-label={`Specification ${index + 1} value`}
                    value={row.value}
                    onChange={(e) =>
                      specification(index, "value", e.target.value)
                    }
                    placeholder="Value"
                  />
                  <button
                    type="button"
                    className="icon-button danger-icon"
                    aria-label={`Remove specification ${index + 1}`}
                    onClick={() =>
                      field(
                        "specifications",
                        form.specifications.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <Icon name="trash" size={17} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-line"
              onClick={() =>
                field("specifications", [
                  ...form.specifications,
                  { label: "", value: "" },
                ])
              }
            >
              <Icon name="plus" size={17} /> Add specification
            </button>
          </section>
        </div>
        <aside className="editor-side">
          <section className="panel form-panel">
            <h2>Publishing</h2>
            <p className="side-note">
              Draft products stay out of the public catalogue.
            </p>
            <label>
              Status
              <select
                value={form.status}
                onChange={(e) => field("status", e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => field("featured", e.target.checked)}
              />
              <span>Feature this product</span>
            </label>
          </section>
          <section className="panel form-panel">
            <h2>Product images</h2>
            <p className="side-note">
              Upload up to 8 JPG, PNG or WebP images (5 MB each). The first
              image is the product card cover.
            </p>
            <label className="product-image-upload">
              <span>＋ &nbsp; Choose product images</span>
              <small>
                {form.images.length} of 8 images added · JPG, PNG or WebP, up to
                5 MB each
              </small>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={uploadImage}
                disabled={uploading || form.images.length >= 8}
              />
            </label>
            {uploading && (
              <p className="side-note" role="status">
                Uploading images…
              </p>
            )}
            {!!form.images.length && (
              <div className="product-image-list">
                {form.images.map((url, index) => (
                  <div className="product-image-item" key={url}>
                    <img src={url} alt={`Product image ${index + 1}`} />
                    <div>
                      <span>
                        {index === 0 ? "Cover image" : `Image ${index + 1}`}
                      </span>
                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            changeImages([
                              url,
                              ...form.images.filter((image) => image !== url),
                            ])
                          }
                        >
                          Make cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          changeImages(
                            form.images.filter((image) => image !== url),
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
        <div className="editor-form-footer">
          <p>
            Changes are visible on the website only when this product is
            published.
          </p>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={busy || uploading}
          >
            {busy ? "Saving…" : "Save product"}
          </button>
        </div>
      </form>
    </>
  );
}

export function Inbox({ type, items, mutate }) {
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const isQuote = type === "quotations";
  const shown = items.filter((item) =>
    [item.name, item.company, item.email, item.message].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );
  async function update(item, status) {
    try {
      setError("");
      await mutate(`/admin/${type}/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (issue) {
      setError(issue.message);
    }
  }
  return (
    <>
      <PageHead
        kicker="ENQUIRIES"
        title={isQuote ? "Quotations" : "Messages"}
        description={
          isQuote
            ? "Track requests for product pricing and availability."
            : "Keep track of enquiries sent through the contact form."
        }
      />
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={`Search ${isQuote ? "quotations" : "messages"}`}
        count={items.length}
      />
      {error && (
        <div className="banner-error" role="alert">
          {error}
        </div>
      )}
      {shown.length ? (
        <div className="inbox-list">
          {shown.map((item) => (
            <article className="panel inbox-item" key={item.id}>
              <div className="inbox-top">
                <div>
                  <span className={`badge ${item.status || "new"}`}>
                    {item.status || "new"}
                  </span>
                  <span className="inbox-date">{date(item.createdAt)}</span>
                </div>
                <div className="inbox-actions">
                  <select
                    aria-label={`Status for ${item.name}`}
                    value={item.status || "new"}
                    onChange={(e) => update(item, e.target.value)}
                  >
                    <option value="new">New</option>
                    <option value="in-progress">In progress</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button
                    className="inbox-delete"
                    type="button"
                    onClick={() => setPendingDelete(item)}
                    aria-label={`Delete ${isQuote ? "quotation" : "message"} from ${item.name || "visitor"}`}
                  >
                    <Icon name="trash" size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
              <h2>{item.name || "Enquiry"}</h2>
              <div className="inbox-meta">
                {item.company && <span>{item.company}</span>}
                {item.email && (
                  <a href={`mailto:${item.email}`}>{item.email}</a>
                )}
                {item.phone && <a href={`tel:${item.phone}`}>{item.phone}</a>}
                {item.productName && <span>Product: {item.productName}</span>}
              </div>
              <p>{item.message}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel">
          <Empty
            icon={type}
            title={`No ${isQuote ? "quotations" : "messages"} found`}
            detail={
              search
                ? "Try a different search."
                : `Incoming ${isQuote ? "quotation requests" : "contact messages"} will appear here.`
            }
          />
        </div>
      )}
      {pendingDelete && (
        <DeleteModal
          item={pendingDelete}
          noun={isQuote ? "quotation" : "message"}
          onClose={() => setPendingDelete(null)}
          onDelete={() => mutate(`/admin/${type}/${pendingDelete.id}`, { method: "DELETE" })}
        />
      )}
    </>
  );
}
