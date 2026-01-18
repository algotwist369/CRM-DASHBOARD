/**
 * Simple logger utility
 * In production, replace with Winston or Pino
 */
const logLevels = {
    ERROR: "ERROR",
    WARN: "WARN",
    INFO: "INFO",
    DEBUG: "DEBUG",
};

const log = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    switch (level) {
        case logLevels.ERROR:
            console.error(logMessage, ...args);
            break;
        case logLevels.WARN:
            console.warn(logMessage, ...args);
            break;
        case logLevels.INFO:
            console.log(logMessage, ...args);
            break;
        case logLevels.DEBUG:
            if (process.env.NODE_ENV !== "production") {
                console.log(logMessage, ...args);
            }
            break;
        default:
            console.log(logMessage, ...args);
    }
};

const logger = {
    error: (message, ...args) => log(logLevels.ERROR, message, ...args),
    warn: (message, ...args) => log(logLevels.WARN, message, ...args),
    info: (message, ...args) => log(logLevels.INFO, message, ...args),
    debug: (message, ...args) => log(logLevels.DEBUG, message, ...args),
};

module.exports = logger;

