/**
 * Structured logger for TourKings.
 * In production, this can be swapped for Pino, Winston, or a cloud logging service.
 * Provides consistent log format with timestamps and context.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  timestamp: string;
}

function formatEntry(entry: LogEntry): string {
  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
    entry.context ? `[${entry.context}]` : "",
    entry.message,
  ].filter(Boolean);
  return parts.join(" ");
}

function log(level: LogLevel, message: string, context?: string, data?: unknown) {
  const entry: LogEntry = {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
  };

  const formatted = formatEntry(entry);

  switch (level) {
    case "debug":
      if (process.env.NODE_ENV !== "production") {
        console.debug(formatted, data !== undefined ? data : "");
      }
      break;
    case "info":
      console.info(formatted, data !== undefined ? data : "");
      break;
    case "warn":
      console.warn(formatted, data !== undefined ? data : "");
      break;
    case "error":
      console.error(formatted, data !== undefined ? data : "");
      break;
  }
}

export const logger = {
  debug: (message: string, context?: string, data?: unknown) =>
    log("debug", message, context, data),
  info: (message: string, context?: string, data?: unknown) =>
    log("info", message, context, data),
  warn: (message: string, context?: string, data?: unknown) =>
    log("warn", message, context, data),
  error: (message: string, context?: string, data?: unknown) =>
    log("error", message, context, data),
};
