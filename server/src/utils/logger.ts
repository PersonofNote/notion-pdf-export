import winston from 'winston';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development (more readable)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: isDevelopment ? 'debug' : 'info',
  format: logFormat,
  defaultMeta: { service: 'notion-pdf-export' },
  transports: [
    // Console output
    new winston.transports.Console({
      format: isDevelopment ? consoleFormat : logFormat,
    }),
    // File output for errors (production)
    ...(isDevelopment
      ? []
      : [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
          }),
        ]),
  ],
});

// Helper methods for common log patterns
export const log = {
  info: (message: string, meta?: object) => logger.info(message, meta),
  warn: (message: string, meta?: object) => logger.warn(message, meta),
  error: (message: string, error?: Error | object, meta?: object) => {
    if (error instanceof Error) {
      logger.error(message, { error: error.message, stack: error.stack, ...meta });
    } else {
      logger.error(message, { ...error, ...meta });
    }
  },
  debug: (message: string, meta?: object) => logger.debug(message, meta),

  // Specific logging patterns
  pdfGeneration: (action: string, meta: object) => {
    logger.info(`PDF Generation: ${action}`, { category: 'pdf-generation', ...meta });
  },

  notionApi: (action: string, meta: object) => {
    logger.info(`Notion API: ${action}`, { category: 'notion-api', ...meta });
  },

  auth: (action: string, meta: object) => {
    logger.info(`Auth: ${action}`, { category: 'auth', ...meta });
  },

  httpRequest: (method: string, path: string, meta?: object) => {
    logger.info(`${method} ${path}`, { category: 'http', ...meta });
  },
};

export default logger;
