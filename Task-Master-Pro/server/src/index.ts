import "dotenv/config";
import app from "./app.js";
import { seedDemoUser } from "./seedDemo.js";

const port = Number(process.env.PORT ?? 3000);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
}

app.listen(port, () => {
  console.log(`TaskFlow API listening on http://localhost:${port}`);
  void seedDemoUser();
});
