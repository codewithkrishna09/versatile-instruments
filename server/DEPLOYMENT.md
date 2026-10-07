# Deployment checks

- Serve the built client with HTTPS. Set `NODE_ENV=production` and `CLIENT_ORIGIN` to its exact origin, without a trailing slash.
- On EC2, set `PERSISTENT_DATA_DIRECTORY` to a protected persistent path such as `/var/lib/versatile-data`. This stores `store.json`, `uploads/` and `mail-outbox/` together. Back up this directory and do not expose it through the frontend static root.
- Run one API process. Mutation handlers are serialized and saves use atomic rename; this JSON store is not a multi-process database. Use a transactional database before running replicas or serverless instances.
- Set `TRUST_PROXY_HOPS` only after verifying the trusted reverse-proxy hop count. Incorrect settings can break per-client rate limiting or trust spoofed addresses.
- First-run production setup requires `ADMIN_SETUP_TOKEN`. Enter it in the setup form, then remove the environment token once the admin exists. Existing accounts are unaffected.
- Configure `RESEND_API_KEY` and `MAIL_FROM` server-side for Resend HTTPS delivery. The sender domain must be verified in Resend. Resend takes precedence over existing SMTP settings; without a Resend key, SMTP remains available. Never put credentials in frontend variables. Contact and product quotation forms save their enquiries in Admin before queuing a customer-only acknowledgement; no team notification is sent. Jobs retry every minute and survive process restarts only on persistent storage. Resend retries use the enquiry ID as an idempotency key (provider retention: 24 hours). Delivery remains at-least-once. Without an email provider configured, enquiries still save but no receipt is queued.
- After deploying, submit a fresh test contact enquiry and inspect Resend Emails for delivery status. `mail:check` checks Resend configuration only; it does not authenticate or send mail.
- The current API does not serve the built frontend. Configure frontend-host cache rules for fingerprinted JS/CSS (`public, max-age=31536000, immutable`) and revalidation for HTML. Configure security headers on the frontend host as well; API headers do not cover a separately hosted page.
- Run `npm run build`, `node --test server/test/*.test.js`, and `npm audit --omit=dev` before deploying. Test login, gallery uploads and contact submission through the real HTTPS proxy after deployment.
- New uploads are decoded, limited to 25 million pixels, resized to at most 1600px, and re-encoded as WebP. Existing uploads remain unchanged. Site source PNGs are retained; `node server/src/optimize-site-images.js` regenerates the optimized public images.

These controls reduce risk; they are not a guarantee of zero latency or complete security. Production mobile-network performance and traffic capacity still need live measurements.
