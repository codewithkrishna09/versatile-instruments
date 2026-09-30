import "dotenv/config";
import { verifyMailConnection } from "./mail.js";

try {
  console.log(await verifyMailConnection());
} catch (error) {
  console.error("Email check failed:", error.message);
  process.exitCode = 1;
}
