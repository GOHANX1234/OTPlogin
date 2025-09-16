import express, { type Request, Response, NextFunction } from "express";
import * as nodePath from "path";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectDatabase } from "./database";

// Add trust proxy to avoid issues with secure cookies behind a proxy/load balancer
// when deployed on Render or similar platforms

const app = express();

// Enable trust proxy to properly handle secure cookies in production environments
app.set('trust proxy', 1);

// CORS configuration
const isProduction = process.env.NODE_ENV === "production";

// Define origins for CORS
const corsOrigin = isProduction
  ? [process.env.CORS_ORIGIN || "https://allfixedpanel.onrender.com/"] // Allow configurable origin in production
  : true; // Allow all origins in development

// Apply CORS middleware with special handling for admin endpoints
app.use((req, res, next) => {
  // More restrictive CORS for admin endpoints
  if (req.path.startsWith('/api/admin/')) {
    // For admin endpoints, only allow same-origin requests in production
    // In development, allow localhost origins only
    const allowedAdminOrigin = isProduction 
      ? (process.env.CORS_ORIGIN || "https://allfixedpanel.onrender.com/").replace(/\/$/, '')
      : `${req.protocol}://${req.get('host')}`;
    
    cors({
      origin: allowedAdminOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      optionsSuccessStatus: 200
    })(req, res, next);
  } else {
    // Standard CORS for other endpoints
    cors({
      origin: corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })(req, res, next);
  }
});

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect to MongoDB first
  try {
    await connectDatabase();
    log("MongoDB connection established");
  } catch (error) {
    log(`Failed to connect to MongoDB: ${error}`);
    process.exit(1);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // In production, we need to serve static files and handle client-side routing
    serveStatic(app);
    
    // Add a catch-all route for client-side routing
    app.get('*', (req, res, next) => {
      // Let API routes pass through to be handled by 404 handler
      if (req.path.startsWith('/api/')) {
        return next();
      }
      console.log(`Serving index.html for client-side route: ${req.path}`);
      res.sendFile(nodePath.resolve(process.cwd(), 'dist', 'public', 'index.html'));
    });
    
    // Add 404 handler for unmatched API routes
    app.use('/api/*', (req, res) => {
      res.status(404).json({ message: 'API endpoint not found' });
    });
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
