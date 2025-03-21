import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import session from "express-session";
import { MemoryStore } from "express-session";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "tlu-steel-cutting-app-secret",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore(), // In production, use a more robust store like Redis or MongoDB
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
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

      console.log(logLine); // Thay log() bằng console.log() vì log() được định nghĩa trong server/vite.ts
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Xử lý lỗi
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Định nghĩa port và host
  const port = process.env.PORT || 5000; // Sử dụng process.env.PORT cho Render
  const host = "0.0.0.0";

  // Khởi động server
  server.listen(port, host, () => {
    console.log(`Serving on http://${host}:${port}`);
  });

  // Xử lý lỗi khi khởi động server
  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.log(`Port ${port} is already in use. Please try a different port.`);
    } else {
      console.log(`Failed to start server: ${error.message}`);
    }
    process.exit(1);
  });
})();