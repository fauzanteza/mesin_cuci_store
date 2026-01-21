import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log error
    logger.error(`❌ ${err.statusCode} ${err.status}: ${err.message}`);
    // logger.error(`📝 Stack: ${err.stack}`); // Stack can be noisy in console, implies file logging
    logger.error(`🌐 URL: ${req.originalUrl}`);
    logger.error(`📱 Method: ${req.method}`);
    // logger.error(`👤 IP: ${req.ip}`); // IP might be undefined locally

    // Development vs Production error response
    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production: don't leak error details
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        } else {
            // Programming or unknown errors
            console.error('💥 UNEXPECTED ERROR:', err);
            res.status(500).json({
                status: 'error',
                message: 'Something went wrong!'
            });
        }
    }
};

export default errorHandler;
