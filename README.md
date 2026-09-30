# Versatile Instruments

React + Node.js project for the Versatile Instruments website. The public Home, About, Solutions, Contact, Products and product-detail pages and admin workspace are implemented; a standalone OEM page is a next phase.

## Structure

```text
client/                     React website and admin interface
  public/                   Static files
  src/
    assets/                 Images and fonts
    components/             Shared UI components
    layouts/                Public and admin layouts
    pages/public/           Public website pages
    pages/admin/            Admin dashboard pages
    services/               API requests
    styles/                 Global styles and design tokens
server/                     Node.js API
  src/
    config/                 Configuration
    controllers/            Request handlers
    middleware/             Authentication and validation
    models/                 Data models
    routes/                 API routes
    services/               Business logic
    utils/                  Shared helpers
  uploads/                  Product image uploads
  data/                     Local JSON data (created at runtime)
```

## Start locally

1. Run `npm install` in the project root.
2. Optionally copy `server/.env.example` to `server/.env` to change local ports or origin.
3. Run `npm run dev`.
4. Open `http://localhost:5173` for Home, `http://localhost:5173/about` for About, `http://localhost:5173/solutions` for Solutions, `http://localhost:5173/products` for the catalogue, `http://localhost:5173/contact` for Contact, or `http://localhost:5173/admin` to create the first admin account (12-character minimum password).

The React app uses port 5173 and the API uses port 5003 by default. Admin data is saved in `server/data/store.json`; uploads are saved in `server/uploads/`. Both are excluded from Git. Back them up before moving or redeploying the site.

To manage the admin login through the server environment, set `ADMIN_LOGIN_EMAIL` and `ADMIN_LOGIN_PASSWORD` in `server/.env`, then restart the API. The password must be 12–256 characters. With both set, the env ID/password replace the old stored login; existing products and enquiries remain untouched. Leave `ADMIN_LOGIN_PASSWORD` empty until you are ready—the stored login continues to work meanwhile. Do not commit or share `.env`. Change either credential in `.env` and restart to apply it. The login form labels this identifier “Admin ID”; an email-shaped ID such as `admin@versatile.in` does not have to be a working mailbox. To intentionally allow the old stored ID as well, set `ADMIN_ALLOW_LEGACY_LOGIN=true` (not recommended).

## Shared external product brochure

Set `SHARED_CATALOGUE_URL` in `server/.env` to a public HTTPS direct-download link, then restart the API. Every product with a blank catalogue field uses this shared default. In the admin product editor, a product-specific public HTTPS PDF link overrides the default for that product only; clearing it restores the default. The brochure PDFs remain with their external providers and are not copied into this server or the product database. With no shared URL, products without their own link generate a PDF in the visitor's browser. Before publishing a Drive link, open it in a private browser window without signing in and confirm that viewers are allowed to download it.

The home page includes application sections, an admin-driven published product preview and a working contact enquiry form. About, Solutions, Products and Contact are standalone pages. The catalogue shows only published products, with search, category filters, pagination and product-detail pages. Admin supports up to eight uploaded images per product; the first image is the catalogue cover. Product-detail quotation forms submit the product ID to the admin Quotations inbox. Solutions has a working brief form; Contact has enquiry-type selection and a detailed form. Both save through the contact endpoint to Admin > Messages. About, Solutions and Contact use illustrative laboratory imagery, not photographs of Versatile Instruments' premises or client projects. Unverified company history, OEM representation, certifications, team size and customer statistics are deliberately omitted. Public endpoints are `GET /api/public/home`, `GET /api/public/products`, `GET /api/public/products/:slug`, `POST /api/quotations` and `POST /api/contacts`. The admin includes dashboard counts, category and product management, product image uploads, and quotation/contact inboxes. This local JSON store and in-memory login sessions are suitable for development. Before production deployment, move data and sessions to a database, add rate limiting for public forms, and configure HTTPS.

## Contact email setup

Contact and solution enquiries are always saved in Admin > Messages first. Email is optional and only starts after SMTP is configured in `server/.env` using the keys documented in `server/.env.example`. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` and `MAIL_TO`; then restart the server. Run `npm run mail:check --workspace=server` to test SMTP connectivity and authentication (this does not prove that the provider has approved the From address). `MAIL_FROM` should be a verified no-reply address permitted by your provider, and `MAIL_TO` should be the team's inbox. The team notification uses the visitor's address as Reply-To. The visitor gets a short automated receipt from the no-reply address. If SMTP is unavailable, the saved admin message remains available and the form still succeeds; the server logs the delivery failure. The contact endpoint limits repeat submissions from one email address. Never place SMTP credentials in the React client or commit `server/.env`.
