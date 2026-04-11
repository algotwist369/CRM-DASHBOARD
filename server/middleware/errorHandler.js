// Express centralized error handler and 404 handler.
// Use at the end of your middleware stack:
// app.use(notFoundHandler);
// app.use(errorHandler);

const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * 404 not found handler
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    });
}

/**
 * Express error handler middleware (4 args)
 */
const errorHandler = (err, req, res, next) => {
    // If response already sent delegate to default handler
    if (res.headersSent) {
        return next(err);
    }

    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || 'Internal Server Error';

    // Handle specific Mongoose/MongoDB errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    } else if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyPattern)[0];
        message = `Duplicate field value entered: ${field}. Please use another value.`;
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = `Resource not found with id of ${err.value}`;
    }

    // Minimal error body for production, extended for development
    const body = {
        success: false,
        message,
    };

    if (NODE_ENV !== 'production') {
        body.error = {
            message: err.message,
            stack: err.stack,
            name: err.name,
        };
    } else {
        // Log critical errors in production (avoid heavy console logs, but keep important ones)
        if (statusCode === 500) {
            console.error(`[CRITICAL ERROR] ${req.method} ${req.originalUrl} - ${err.stack || message}`);
        } else {
            console.warn(`[API WARNING] ${req.method} ${req.originalUrl} - ${statusCode} - ${message}`);
        }
    }

    res.status(statusCode).json(body);
}

module.exports = {
    notFoundHandler,
    errorHandler,
};
