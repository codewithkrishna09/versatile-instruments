function escapeHtml(value) {
  return String(value || "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

// Use one shared ID in the HTML and provider attachment. A domain-style ID is
// recognised consistently by Gmail and other webmail clients.
export const INLINE_LOGO_CID = "versatile-logo@versatileinstruments.com";

export function createReceipt(item) {
  const isProduct = item.kind === "quotations" || Boolean(item.productName);
  const name = String(item.name || "there").trim();
  const product = String(item.productName || "").trim();
  const reference = String(item.id || "").trim();
  const title = isProduct
    ? "Your product enquiry is with us"
    : "Thank you for contacting us";
  const detail = isProduct
    ? "We have received your request about the product below. Our team can review the details you shared and follow up with you."
    : "We have received your message. Our team can review the details you shared and follow up with you.";
  const text = [
    `Hello ${name},`,
    "",
    title,
    "",
    detail,
    ...(product ? ["", `Product: ${product}`] : []),
    "",
    `Reference: ${reference}`,
    "",
    "This is an automated acknowledgement. Please do not reply to this email.",
    "",
    "Versatile Instruments",
    "H. No. 2753, 3rd Floor, Street No. 13, Ranjit Nagar, Patel Nagar South, New Delhi, Central Delhi, Delhi 110008",
    "Phone: +91 95594 54555",
    "Email: contact@versatileinstruments.com",
    "Sales: sales@versatileinstruments.com",
  ].join("\n");
  const footer = `<tr><td style="padding:24px 32px 28px;border-top:1px solid #e3e7e0;background:#f8f9f6;color:#52615b;font-size:12px;line-height:1.7"><strong style="display:block;color:#1c2e31;font-size:15px;line-height:1.4;margin-bottom:7px">Versatile Instruments</strong><span style="display:block;max-width:460px">H. No. 2753, 3rd Floor, Street No. 13, Ranjit Nagar,<br>Patel Nagar South, New Delhi, Central Delhi, Delhi 110008</span><table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:15px;font-size:12px;line-height:1.8"><tr><td style="padding-right:12px;color:#66756d;font-weight:700">Phone</td><td><a href="tel:+919559454555" style="color:#1c2e31;text-decoration:underline">+91 95594 54555</a></td></tr><tr><td style="padding-right:12px;color:#66756d;font-weight:700">Email</td><td><a href="mailto:contact@versatileinstruments.com" style="color:#1c2e31;text-decoration:underline">contact@versatileinstruments.com</a></td></tr><tr><td style="padding-right:12px;color:#66756d;font-weight:700">Sales</td><td><a href="mailto:sales@versatileinstruments.com" style="color:#1c2e31;text-decoration:underline">sales@versatileinstruments.com</a></td></tr></table><p style="margin:17px 0 0;padding-top:14px;border-top:1px solid #e3e7e0;color:#738079;font-size:11px;line-height:1.6">This is an automated acknowledgement from a no-reply address. Please do not reply to this email.</p></td></tr>`;
  const header = `<tr><td style="padding:20px 28px;background:#1c2e31"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="82" height="82" align="center" valign="middle" bgcolor="#f5f3ee" style="width:82px;height:82px;background:#f5f3ee;border-radius:12px"><img src="cid:${INLINE_LOGO_CID}" width="80" height="80" alt="Versatile Instruments logo" style="display:block;width:80px;height:80px;object-fit:contain;border:0"></td><td valign="middle" style="padding-left:18px;color:#ffffff;font-size:17px;font-weight:700;letter-spacing:1px;line-height:1.35">VERSATILE<br><span style="font-size:10px;font-weight:400;letter-spacing:2.5px">INSTRUMENTS</span></td></tr></table></td></tr>`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#f5f3ee;font-family:Arial,Helvetica,sans-serif;color:#1c2e31"><div style="display:none;max-height:0;overflow:hidden;opacity:0">We received your ${isProduct ? "product enquiry" : "message"}. Reference: ${escapeHtml(reference)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ee"><tr><td align="center" style="padding:28px 14px 44px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #d8d9d1">${header}<tr><td style="padding:38px 32px 16px"><div style="color:#a76949;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase">ENQUIRY RECEIVED</div><h1 style="font-size:29px;line-height:1.2;letter-spacing:-1px;margin:15px 0 24px;color:#1c2e31">${title}</h1><p style="font-size:15px;line-height:1.8;margin:0 0 18px">Hello ${escapeHtml(name)},</p><p style="font-size:15px;line-height:1.8;color:#52615b;margin:0 0 26px">${detail}</p>${product ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f3ee;border-left:3px solid #a76949"><tr><td style="padding:17px 20px"><span style="display:block;color:#66756d;font-size:10px;font-weight:700;letter-spacing:1px">PRODUCT</span><span style="display:block;margin-top:7px;font-size:15px;font-weight:700;line-height:1.5">${escapeHtml(product)}</span></td></tr></table>` : ""}<p style="font-size:12px;line-height:1.6;color:#66756d;margin:26px 0 18px">Reference: <strong>${escapeHtml(reference)}</strong></p></td></tr>${footer}</table></td></tr></table></body></html>`;
  return {
    subject: isProduct
      ? "Product enquiry received | Versatile Instruments"
      : "Message received | Versatile Instruments",
    text,
    html,
  };
}
