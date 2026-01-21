import AppError from '../utils/appError.js';

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    error.status = 'fail';
    error.isOperational = true;

    // Custom 404 response
    res.status(404).json({
        status: 'fail',
        message: `Route ${req.originalUrl} not found on this server`,
        error: {
            statusCode: 404,
            status: 'fail',
            isOperational: true
        },
        suggestions: [
            'Check the URL for typos',
            'Ensure you are using the correct HTTP method',
            'Verify the endpoint exists in the API documentation',
            'Contact support if you believe this is an error'
        ],
        availableEndpoints: {
            root: 'GET /',
            apiDocs: 'GET /api-docs',
            auth: 'POST /api/auth/login, POST /api/auth/register',
            products: 'GET /api/products, GET /api/products/:id',
        }
    });
};

export default notFound;
