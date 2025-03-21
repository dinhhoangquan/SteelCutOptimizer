import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import session from "express-session";
import { MemoryStore } from "express-session";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cấu hình CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://steelcutoptimizer-fontend.onrender.com");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Setup session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "tlu-steel-cutting-app-secret",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore(),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Middleware để log request và response
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

// Thêm route mặc định cho GET /
app.get("/", (req, res) => {
  res.json({ message: "Welcome to SteelCutOptimizer API!" });
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  const port = process.env.PORT || 5000;
  const host = "0.0.0.0";
  server.listen(port, host, () => {
    console.log(`Serving on http://${host}:${port}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.log(`Port ${port} is already in use. Please try a different port.`);
    } else {
      console.log(`Failed to start server: ${error.message}`);
    }
    process.exit(1);
  });
})();