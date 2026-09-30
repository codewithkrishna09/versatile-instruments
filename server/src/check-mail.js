import "dotenv/config";
import { verifyMailConnection } from "./mail.js";

try {
  await verifyMailConnection();
  console.log(
    "SMTP connection and authentication succeeded. Confirm sender approval with your mail provider before going live.",
  );
} catch (error) {
  console.error("SMTP check failed:", error.message);
  process.exitCode = 1;
}
