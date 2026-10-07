import express from "express";
import cors from "cors";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { readFile, writeFile, mkdir, rename, unlink } from "node:fs/promises";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import multer from "multer";
import { queueCustomerReceipt } from "./mail.js";

const app = express();
// Set an exact hop count only when the deployment has that many trusted proxies.
if (/^[1-9]\d*$/.test(process.env.TRUST_PROXY_HOPS || ""))
  app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS));
app.disable("x-powered-by");
const deriveKey = promisify(scrypt);
const sessionLifetime = 24 * 60 * 60 * 1000;
const persistentDataDirectory = process.env.PERSISTENT_DATA_DIRECTORY?.trim();
const dataFile =
  process.env.DATA_FILE ||
  (persistentDataDirectory && resolve(persistentDataDirectory, "store.json")) ||
  resolve(dirname(fileURLToPath(import.meta.url)), "../data/store.json");
// Sessions are intentionally process-local; a server restart signs admins out.
const sessions = new Map();
// Limit automated contact receipts to the same address within one server process.
const contactAttempts = new Map();
const initialData = {
  admin: null,
  categories: [],
  products: [],
  quotations: [],
  contacts: [],
};
const uploadDirectory = resolve(
  process.env.UPLOAD_DIRECTORY ||
    (persistentDataDirectory && resolve(persistentDataDirectory, "uploads")) ||
    resolve(dirname(fileURLToPath(import.meta.url)), "../uploads"),
);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0 },
  fileFilter: (_request, file, callback) =>
    callback(
      null,
      ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype),
    ),
});

app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(
  "/uploads",
  express.static(uploadDirectory, { maxAge: "7d", immutable: true }),
);
app.use("/api", (_request, response, next) => {
  response.set("Cache-Control", "no-store");
  next();
});
const limiter = (limit, windowMs) =>
  rateLimit({
    limit,
    windowMs,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
  });
app.use("/api/auth/login", limiter(10, 15 * 60 * 1000));
app.use("/api/auth/setup", limiter(5, 60 * 60 * 1000));
for (const route of ["/api/contacts", "/api/quotations"])
  app.use(route, limiter(10, 15 * 60 * 1000));
app.use("/api/admin/upload", limiter(30, 15 * 60 * 1000));
// Browser-origin checks supplement SameSite cookies; CORS alone does not prevent writes.
app.use("/api", (request, response, next) => {
  if (
    !["GET", "HEAD", "OPTIONS"].includes(request.method) &&
    request.headers.origin &&
    request.headers.origin !==
      (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  )
    return fail(response, "Origin not allowed.", 403);
  next();
});
// Serialize complete mutation handlers, even if their browser disconnects mid-write.
let writeQueue = Promise.resolve();
for (const method of ["post", "put", "patch", "delete"]) {
  const register = app[method].bind(app);
  app[method] = (path, ...handlers) => {
    const handler = handlers.pop();
    return register(path, ...handlers, async (request, response, next) => {
      const previous = writeQueue;
      let release;
      writeQueue = new Promise((done) => {
        release = done;
      });
      await previous;
      try {
        await handler(request, response, next);
      } catch (error) {
        next(error);
      } finally {
        release();
      }
    });
  };
}

async function load() {
  // The store is created on the first write, so a fresh installation starts empty.
  try {
    return { ...initialData, ...JSON.parse(await readFile(dataFile, "utf8")) };
  } catch (error) {
    if (error.code === "ENOENT") return structuredClone(initialData);
    throw error;
  }
}
async function save(data) {
  await mkdir(dirname(dataFile), { recursive: true });
  const temporary = `${dataFile}.${identifier()}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(data, null, 2), { mode: 0o600 });
    await rename(temporary, dataFile);
  } finally {
    await unlink(temporary).catch(() => {});
  }
}
async function passwordHash(password, salt) {
  return (await deriveKey(password, salt, 64)).toString("hex");
}
function envAdminCredentials() {
  const email = clean(process.env.ADMIN_LOGIN_EMAIL).toLowerCase();
  const password = process.env.ADMIN_LOGIN_PASSWORD || "";
  // An empty password keeps the existing stored login active until the owner
  // has set both values. Never persist the env password into the product store.
  if (!password) return null;
  if (
    !/^\S+@\S+\.\S+$/.test(email) ||
    password.length < 12 ||
    password.length > 256
  )
    return { invalid: true };
  return { email, password };
}
function cookie(request) {
  // Only the session token is read; the signed-in state is never trusted from the client.
  return Object.fromEntries(
    (request.headers.cookie || "")
      .split(";")
      .filter(Boolean)
      .map((part) => {
        const [key, ...value] = part.trim().split("=");
        return [key, value.join("=")];
      }),
  );
}
function activeSession(request) {
  const token = cookie(request).vi_session;
  const session = sessions.get(token);
  if (session && Date.now() - session.createdAt < sessionLifetime)
    return session;
  sessions.delete(token);
  return null;
}
function requireAdmin(request, response, next) {
  if (!activeSession(request))
    return response.status(401).json({ error: "Sign in required." });
  next();
}
function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}
function slug(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
function productSlug(product) {
  // A stored slug survives product renames; legacy records receive a deterministic URL.
  return (
    product.slug ||
    `${slug(product.name) || "instrument"}-${product.id.slice(0, 8)}`
  );
}
function publicProduct(product, categories) {
  const sharedCatalogueUrl = getSharedCatalogueUrl();
  return {
    ...product,
    catalogueUrl: product.catalogueUrl || sharedCatalogueUrl || "",
    slug: productSlug(product),
    images: product.images?.length
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [],
    category:
      categories.find((category) => category.id === product.categoryId) || null,
  };
}
function getSharedCatalogueUrl() {
  const value = process.env.SHARED_CATALOGUE_URL?.trim() || "";
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : "";
  } catch {
    return "";
  }
}
function identifier() {
  return randomBytes(12).toString("hex");
}
function fail(response, message, code = 400) {
  return response.status(code).json({ error: message });
}

app.get("/api/health", (_request, response) => response.json({ status: "ok" }));
app.get("/api/public/home", async (_request, response) => {
  const data = await load();
  const publishedProducts = data.products.filter(
    (product) => product.status === "published",
  );
  response.json({
    categories: data.categories.filter((category) =>
      publishedProducts.some((product) => product.categoryId === category.id),
    ),
    products: publishedProducts
      .slice()
      .sort((first, second) => Number(second.featured) - Number(first.featured))
      .slice(0, 6)
      .map((product) => publicProduct(product, data.categories)),
  });
});
app.get("/api/public/products", async (request, response) => {
  const data = await load();
  const search = clean(request.query.search).toLowerCase();
  const categorySlug = clean(request.query.category);
  const page = Math.max(1, Number.parseInt(request.query.page, 10) || 1);
  const limit = 12;
  const category = data.categories.find((item) => item.slug === categorySlug);
  const published = data.products.filter((item) => item.status === "published");
  const filtered = published.filter((item) => {
    const matchesCategory = !categorySlug || item.categoryId === category?.id;
    const matchesSearch =
      !search ||
      [item.name, item.sku, item.overview, item.description].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(search),
      );
    return matchesCategory && matchesSearch;
  });
  filtered.sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name),
  );
  response.json({
    categories: data.categories.map((item) => ({
      ...item,
      productCount: published.filter(
        (product) => product.categoryId === item.id,
      ).length,
    })),
    products: filtered
      .slice((page - 1) * limit, page * limit)
      .map((item) => publicProduct(item, data.categories)),
    total: filtered.length,
    totalPublished: published.length,
    page,
    pageCount: Math.ceil(filtered.length / limit),
  });
});
app.get("/api/public/products/:slug", async (request, response) => {
  const data = await load();
  const product = data.products.find(
    (item) =>
      item.status === "published" && productSlug(item) === request.params.slug,
  );
  if (!product) return fail(response, "Product not found.", 404);
  const related = data.products
    .filter(
      (item) =>
        item.status === "published" &&
        item.id !== product.id &&
        item.categoryId === product.categoryId,
    )
    .slice(0, 3)
    .map((item) => publicProduct(item, data.categories));
  response.json({ product: publicProduct(product, data.categories), related });
});
app.get("/api/auth/status", async (request, response) => {
  const data = await load();
  const envAdmin = envAdminCredentials();
  response.json({
    setupRequired: !data.admin && !envAdmin,
    authenticated: Boolean(activeSession(request)),
  });
});
app.get("/api/admin/catalogue-config", requireAdmin, (_request, response) => {
  response.json({ sharedCatalogueUrl: getSharedCatalogueUrl() });
});
app.post("/api/auth/setup", async (request, response) => {
  // First-run setup closes permanently as soon as an admin account is stored.
  const data = await load();
  if (data.admin || envAdminCredentials())
    return fail(response, "Admin account already exists.", 409);
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.ADMIN_SETUP_TOKEN ||
      request.headers["x-setup-token"] !== process.env.ADMIN_SETUP_TOKEN)
  )
    return fail(
      response,
      "Initial admin setup requires server-owner authorization.",
      403,
    );
  const email = clean(request.body.email).toLowerCase();
  const password = request.body.password;
  if (
    !/^\S+@\S+\.\S+$/.test(email) ||
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 256
  )
    return fail(
      response,
      "Enter a valid email and a password of at least 12 characters.",
    );
  const salt = randomBytes(16).toString("hex");
  data.admin = { email, salt, hash: await passwordHash(password, salt) };
  await save(data);
  response.status(201).json({ ok: true });
});
app.post("/api/auth/login", async (request, response) => {
  const data = await load();
  const admin = data.admin;
  const envAdmin = envAdminCredentials();
  if (envAdmin?.invalid)
    return fail(response, "Admin sign-in configuration is invalid.", 503);
  const email = clean(request.body.email).toLowerCase();
  const password = request.body.password;
  if (typeof password !== "string" || password.length > 256)
    return fail(response, "Invalid email or password.", 401);
  let valid = false;
  if (envAdmin && email === envAdmin.email) {
    const salt = "versatile-env-admin-v1";
    const candidate = Buffer.from(await passwordHash(password, salt), "hex");
    const expected = Buffer.from(
      await passwordHash(envAdmin.password, salt),
      "hex",
    );
    valid = timingSafeEqual(candidate, expected);
  } else if (
    admin &&
    email === admin.email &&
    (!envAdmin || process.env.ADMIN_ALLOW_LEGACY_LOGIN === "true")
  ) {
    const candidate = Buffer.from(
      await passwordHash(password, admin.salt),
      "hex",
    );
    valid = timingSafeEqual(candidate, Buffer.from(admin.hash, "hex"));
  }
  if (!valid) return fail(response, "Invalid email or password.", 401);
  for (const [key, session] of sessions)
    if (Date.now() - session.createdAt >= sessionLifetime) sessions.delete(key);
  sessions.delete(cookie(request).vi_session);
  const token = randomBytes(32).toString("hex");
  sessions.set(token, { email, createdAt: Date.now() });
  response.cookie("vi_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 86400000,
  });
  response.json({ ok: true });
});
app.post("/api/auth/logout", requireAdmin, (request, response) => {
  sessions.delete(cookie(request).vi_session);
  response.clearCookie("vi_session");
  response.json({ ok: true });
});
app.post(
  "/api/admin/upload",
  requireAdmin,
  upload.single("image"),
  async (request, response) => {
    if (!request.file)
      return fail(response, "Choose a JPG, PNG or WebP image under 5 MB.");
    try {
      const image = sharp(request.file.buffer, { limitInputPixels: 25000000 });
      const metadata = await image.metadata();
      if (!["jpeg", "png", "webp"].includes(metadata.format))
        return fail(response, "Invalid image content.");
      const buffer = await image
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();
      await mkdir(uploadDirectory, { recursive: true });
      const filename = `${identifier()}.webp`;
      await writeFile(resolve(uploadDirectory, filename), buffer);
      response.status(201).json({ url: `/uploads/${filename}` });
    } catch {
      return fail(
        response,
        "Image could not be decoded. Upload a valid JPG, PNG or WebP.",
      );
    }
  },
);

for (const collection of ["quotations", "contacts"]) {
  app.post(`/api/${collection}`, async (request, response) => {
    const data = await load();
    const name = clean(request.body.name);
    const email = clean(request.body.email).toLowerCase();
    const message = clean(request.body.message);
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message)
      return fail(response, "Name, valid email and message are required.");
    if (
      name.length > 120 ||
      email.length > 254 ||
      message.length > 10000 ||
      clean(request.body.company).length > 180 ||
      clean(request.body.phone).length > 60
    )
      return fail(response, "One or more fields are too long.");
    if (collection === "contacts") {
      const now = Date.now();
      for (const [address, times] of contactAttempts)
        if (!times.some((time) => now - time < 15 * 60 * 1000))
          contactAttempts.delete(address);
      const recent = (contactAttempts.get(email) || []).filter(
        (time) => now - time < 15 * 60 * 1000,
      );
      if (recent.length >= 3)
        return fail(
          response,
          "Please wait before sending another enquiry.",
          429,
        );
      contactAttempts.set(email, recent);
    }
    const product =
      collection === "quotations"
        ? data.products.find(
            (item) =>
              item.id === clean(request.body.productId) &&
              item.status === "published",
          )
        : null;
    if (collection === "quotations" && !product)
      return fail(response, "Choose a published product.");
    const item = {
      id: identifier(),
      name,
      email,
      message,
      company: clean(request.body.company),
      phone: clean(request.body.phone),
      ...(product ? { productId: product.id, productName: product.name } : {}),
      status: "new",
      createdAt: new Date().toISOString(),
    };
    data[collection].push(item);
    await save(data);
    if (collection === "contacts") contactAttempts.get(email).push(Date.now());
    // Admin record is saved first; temporary SMTP failure never loses the enquiry.
    try {
      await queueCustomerReceipt({ ...item, kind: collection });
    } catch {
      console.error(
        `Could not queue customer receipt for ${item.id}; enquiry remains in admin.`,
      );
    }
    response.status(201).json({ ok: true });
  });
}

app.get("/api/admin/overview", requireAdmin, async (_request, response) => {
  const data = await load();
  response.json({
    categories: data.categories.length,
    products: data.products.length,
    quotations: data.quotations.length,
    contacts: data.contacts.length,
    recentQuotations: data.quotations.slice(-5).reverse(),
  });
});
for (const collection of ["categories", "products", "quotations", "contacts"]) {
  app.get(
    `/api/admin/${collection}`,
    requireAdmin,
    async (_request, response) => {
      const data = await load();
      response.json(data[collection].slice().reverse());
    },
  );
}

app.post("/api/admin/categories", requireAdmin, async (request, response) => {
  const data = await load();
  const name = clean(request.body.name);
  if (!name) return fail(response, "Category name is required.");
  if (
    name.length > 180 ||
    clean(request.body.description).length > 2000 ||
    !safeImageUrl(request.body.imageUrl)
  )
    return fail(response, "Enter valid category details and a safe image URL.");
  const itemSlug = slug(request.body.slug || name);
  if (!itemSlug || data.categories.some((item) => item.slug === itemSlug))
    return fail(response, "Choose a unique category slug.");
  const item = {
    id: identifier(),
    name,
    slug: itemSlug,
    description: clean(request.body.description),
    imageUrl: clean(request.body.imageUrl),
    createdAt: new Date().toISOString(),
  };
  data.categories.push(item);
  await save(data);
  response.status(201).json(item);
});
app.put(
  "/api/admin/categories/:id",
  requireAdmin,
  async (request, response) => {
    const data = await load();
    const item = data.categories.find(
      (value) => value.id === request.params.id,
    );
    if (!item) return fail(response, "Category not found.", 404);
    const name = clean(request.body.name);
    if (
      name.length > 180 ||
      clean(request.body.description).length > 2000 ||
      !safeImageUrl(request.body.imageUrl)
    )
      return fail(
        response,
        "Enter valid category details and a safe image URL.",
      );
    const itemSlug = slug(request.body.slug || name);
    if (
      !name ||
      !itemSlug ||
      data.categories.some(
        (value) => value.id !== item.id && value.slug === itemSlug,
      )
    )
      return fail(response, "Enter a name and unique slug.");
    Object.assign(item, {
      name,
      slug: itemSlug,
      description: clean(request.body.description),
      imageUrl: clean(request.body.imageUrl),
    });
    await save(data);
    response.json(item);
  },
);
app.delete(
  "/api/admin/categories/:id",
  requireAdmin,
  async (request, response) => {
    const data = await load();
    const item = data.categories.find(
      (value) => value.id === request.params.id,
    );
    if (!item) return fail(response, "Category not found.", 404);
    // Keep product references valid instead of silently orphaning them.
    if (data.products.some((value) => value.categoryId === item.id))
      return fail(
        response,
        "Move or delete products in this category first.",
        409,
      );
    data.categories = data.categories.filter((value) => value.id !== item.id);
    await save(data);
    response.status(204).end();
  },
);

function safeImageUrl(value) {
  const url = clean(value);
  if (!url) return true;
  if (/^\/(?:uploads|images)\/[a-zA-Z0-9_.-]+$/.test(url)) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password;
  } catch {
    return false;
  }
}
function productPayload(body, categories) {
  // Normalize editable rows before saving; blank rows in the form are ignored.
  const name = clean(body.name);
  const categoryId = clean(body.categoryId);
  if (!name || !categories.some((item) => item.id === categoryId))
    return { error: "Product name and a valid category are required." };
  const catalogueUrl = clean(body.catalogueUrl);
  if (catalogueUrl) {
    try {
      if (new URL(catalogueUrl).protocol !== "https:")
        return { error: "Catalogue link must use HTTPS." };
    } catch {
      return { error: "Enter a valid catalogue link." };
    }
  }
  const specifications = Array.isArray(body.specifications)
    ? body.specifications
        .filter((row) => clean(row.label) && clean(row.value))
        .map((row) => ({ label: clean(row.label), value: clean(row.value) }))
    : [];
  // Legacy single-image records remain editable while new records can keep a gallery.
  const images = Array.isArray(body.images)
    ? body.images.map(clean).filter(Boolean).slice(0, 8)
    : clean(body.imageUrl)
      ? [clean(body.imageUrl)]
      : [];
  if (images.some((url) => !safeImageUrl(url)))
    return { error: "Use uploaded images or secure HTTPS image links." };
  if (
    name.length > 180 ||
    clean(body.overview).length > 5000 ||
    clean(body.description).length > 50000 ||
    specifications.length > 100 ||
    (Array.isArray(body.features) && body.features.length > 100)
  )
    return { error: "Product details exceed the supported limits." };
  return {
    name,
    categoryId,
    sku: clean(body.sku),
    overview: clean(body.overview),
    description: clean(body.description),
    catalogueUrl,
    imageUrl: images[0] || "",
    images,
    features: Array.isArray(body.features)
      ? body.features.map(clean).filter(Boolean)
      : [],
    specifications,
    status: body.status === "published" ? "published" : "draft",
    featured: Boolean(body.featured),
  };
}
app.post("/api/admin/products", requireAdmin, async (request, response) => {
  const data = await load();
  const payload = productPayload(request.body, data.categories);
  if (payload.error) return fail(response, payload.error);
  const item = {
    id: identifier(),
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  item.slug = productSlug(item);
  data.products.push(item);
  await save(data);
  response.status(201).json(item);
});
app.put("/api/admin/products/:id", requireAdmin, async (request, response) => {
  const data = await load();
  const item = data.products.find((value) => value.id === request.params.id);
  if (!item) return fail(response, "Product not found.", 404);
  const payload = productPayload(request.body, data.categories);
  if (payload.error) return fail(response, payload.error);
  item.slug ||= productSlug(item);
  Object.assign(item, payload, { updatedAt: new Date().toISOString() });
  await save(data);
  response.json(item);
});
app.delete(
  "/api/admin/products/:id",
  requireAdmin,
  async (request, response) => {
    const data = await load();
    if (!data.products.some((value) => value.id === request.params.id))
      return fail(response, "Product not found.", 404);
    data.products = data.products.filter(
      (value) => value.id !== request.params.id,
    );
    await save(data);
    response.status(204).end();
  },
);

for (const collection of ["quotations", "contacts"]) {
  app.patch(
    `/api/admin/${collection}/:id`,
    requireAdmin,
    async (request, response) => {
      const data = await load();
      const item = data[collection].find(
        (value) => value.id === request.params.id,
      );
      if (!item) return fail(response, "Message not found.", 404);
      if (!["new", "in-progress", "closed"].includes(request.body.status))
        return fail(response, "Invalid status.");
      item.status = request.body.status;
      await save(data);
      response.json(item);
    },
  );
  app.delete(
    `/api/admin/${collection}/:id`,
    requireAdmin,
    async (request, response) => {
      const data = await load();
      if (!data[collection].some((item) => item.id === request.params.id))
        return fail(response, "Message not found.", 404);
      data[collection] = data[collection].filter(
        (item) => item.id !== request.params.id,
      );
      await save(data);
      response.status(204).end();
    },
  );
}

app.use((error, _request, response, _next) => {
  if (error.type === "entity.too.large")
    return fail(response, "Request is too large.", 413);
  if (error.type === "entity.parse.failed")
    return fail(response, "Invalid JSON request.");
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE")
    return response.status(413).json({ error: "Image must be under 5 MB." });
  if (error instanceof multer.MulterError)
    return fail(response, "Upload one supported image at a time.");
  console.error(error);
  response
    .status(500)
    .json({ error: "Something went wrong. Please try again." });
});

export default app;
