import "dotenv/config";
import app from "./app.js";
import { processMailOutbox } from "./mail.js";

const port = Number(process.env.PORT) || 5003;

app.listen(port, () => {
  console.log(`Versatile Instruments API listening on port ${port}`);
});
processMailOutbox();
