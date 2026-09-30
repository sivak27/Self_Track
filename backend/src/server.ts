import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { getDb } from "./database/connection.js";

// Initialize SQLite database and verify tables/indexes
getDb();

const app = createApp();

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`🚀 Personal Control Center REST API running on port ${env.PORT} (0.0.0.0)`);
  console.log(`📡 Health check available at http://localhost:${env.PORT}/health and /api/health`);
  console.log(`🌐 Base API endpoint at http://localhost:${env.PORT}/api`);
});
