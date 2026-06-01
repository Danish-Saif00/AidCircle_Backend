import { app } from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.port, () => {
  console.log(
    JSON.stringify({
      level: "info",
      event: "SERVER_STARTED",
      app: env.app.name,
      environment: env.nodeEnv,
      port: env.port,
      healthUrl: `http://localhost:${env.port}/health`,
      apiUrl: `http://localhost:${env.port}/api/v1`,
      timestamp: new Date().toISOString(),
    }),
  );
});

function shutdown(signal: NodeJS.Signals): void {
  console.log(
    JSON.stringify({
      level: "info",
      event: "SERVER_SHUTDOWN_STARTED",
      signal,
      timestamp: new Date().toISOString(),
    }),
  );

  server.close((error?: Error) => {
    if (error) {
      console.error(
        JSON.stringify({
          level: "error",
          event: "SERVER_SHUTDOWN_FAILED",
          message: error.message,
          timestamp: new Date().toISOString(),
        }),
      );

      process.exit(1);
    }

    console.log(
      JSON.stringify({
        level: "info",
        event: "SERVER_SHUTDOWN_COMPLETED",
        timestamp: new Date().toISOString(),
      }),
    );

    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("unhandledRejection", (reason) => {
  console.error(
    JSON.stringify({
      level: "error",
      event: "UNHANDLED_REJECTION",
      reason: reason instanceof Error ? reason.message : String(reason),
      timestamp: new Date().toISOString(),
    }),
  );
});

process.on("uncaughtException", (error) => {
  console.error(
    JSON.stringify({
      level: "error",
      event: "UNCAUGHT_EXCEPTION",
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    }),
  );

  process.exit(1);
});