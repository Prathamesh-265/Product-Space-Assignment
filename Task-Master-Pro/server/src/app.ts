import express, { type Express } from "express";
import cors from "cors";
import router from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app: Express = express();

// Allow requests from the Vercel frontend (and localhost for dev)
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Render health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url.split("?")[0]}`);
  next();
});

// Health-check endpoint for Render
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", router);

app.use(errorHandler);

export default app;
