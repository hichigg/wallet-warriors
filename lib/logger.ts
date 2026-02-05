// lib/logger.ts
// Thin logging wrapper. Logs to console in dev, sanitizes in production.
// Swap the implementation here when adding Sentry/Datadog later.

const isDev = process.env.NODE_ENV === "development";

function sanitize(args: unknown[]): unknown[] {
  return args.map((arg) => {
    if (arg instanceof Error) {
      return isDev ? arg : { message: arg.message, name: arg.name };
    }
    return arg;
  });
}

export const logger = {
  error(...args: unknown[]) {
    console.error("[ERROR]", ...sanitize(args));
  },
  warn(...args: unknown[]) {
    if (isDev) console.warn("[WARN]", ...args);
  },
  info(...args: unknown[]) {
    if (isDev) console.log("[INFO]", ...args);
  },
};
