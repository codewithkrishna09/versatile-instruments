# Deployment checks

- Serve the built client with HTTPS. Set `NODE_ENV=production` and `CLIENT_ORIGIN` to its exact origin, without a trailing slash.
- Keep `server/data` and `server/uploads` on persistent storage, outside the frontend static root. Back them up. Protect access to the store and mail outbox: both contain private data.
- Run one API process. Mutation handlers are serialized and saves use atomic rename; this JSON store is not a multi-process database. Use a transactional database before running replicas or serverless instances.
- Set `TRUST_PROXY_HOPS` only after verifying the trusted reverse-proxy hop count. Incorrect settings can break per-client rate limiting or trust spoofed addresses.
- First-run production setup requires `ADMIN_SETUP_TOKEN`. Enter it in the setup form, then remove the environment token once the admin exists. Existing accounts are unaffected.
- Configure SMTP credentials server-side only. Contact and product quotation forms save their enquiries in Admin before queuing a customer-only acknowledgement; no team notification is sent. Jobs retry every minute and survive process restarts. Delivery is at-least-once, so a crash during delivery can duplicate a receipt. Admin records remain authoritative. Without SMTP configuration, enquiries still save but no receipt is queued.
- The current API does not serve the built frontend. Configure frontend-host cache rules for fingerprinted JS/CSS (`public, max-age=31536000, immutable`) and revalidation for HTML. Configure security headers on the frontend host as well; API headers do not cover a separately hosted page.
- Run `npm run build`, `node --test server/test/*.test.js`, and `npm audit --omit=dev` before deploying. Test login, gallery uploads and contact submission through the real HTTPS proxy after deployment.
- New uploads are decoded, limited to 25 million pixels, resized to at most 1600px, and re-encoded as WebP. Existing uploads remain unchanged. Site source PNGs are retained; `node server/src/optimize-site-images.js` regenerates the optimized public images.

These controls reduce risk; they are not a guarantee of zero latency or complete security. Production mobile-network performance and traffic capacity still need live measurements.
