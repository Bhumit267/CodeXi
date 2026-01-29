// Middleware function to handle 404 errors when a client requests a resource that does not exist.
const notFound = (req, res, next) => {
    // Create a new error object with a message that includes the requested URL
    const error = new Error(`Not found - ${req.originalUrl}`);

    // Set the HTTP status code for this error to 404 (Not Found)
    res.status(404);

    // Pass the error object to the next middleware function in the stack. This will invoke the error handling middleware.
    next(error);
}


//Error handler middleware function. This function is called whenever an error is encountered in any of the previous middleware functions or route handlers.

const errorHandler = (err, req, res, next) => {
    // Set the HTTP status code based on the error. If the status code is
    // not already set, set it to 500 (Internal Server Error)
    let statusCode = err.statusCode ?? 500;

    // Set the error message based on the error. If the error is a CastError
    // (which is thrown when a MongoDB ID is invalid), set the message to
    // 'Resource not found'. Otherwise, use the error message that was
    // provided
    let message = err.message;
    if(err.name == 'CastError' && err.kind == 'ObjectId') {
        message = 'Resource not found';
        statusCode = 404;
    }

    // Send the error response
    return res.status(statusCode).json({
        // The message is the error message that was set above
        message,
        // If the NODE_ENV environment variable is 'production', set the stack
        // property to null. In production, we don't want to send a full
        // stack trace to clients because it could contain sensitive
        // information
        stack: process.env.NODE_ENV == 'production' ? null : err.stack
    })
}

module.exports = {
    notFound,
    errorHandler
}