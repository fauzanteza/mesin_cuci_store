import logger from '../utils/logger.js';

const loggerMiddleware = (req, res, next) => {
    logger.http(`${req.method} ${req.originalUrl} - ${req.ip}`);
    next();
};

export default loggerMiddleware;
