function ApiError(statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.message = message;

    return error;
}

module.exports = {ApiError};