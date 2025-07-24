// middleware/errorHandler.js

/**
 * Custom error class for handling application-specific errors.
 * This allows us to throw errors with specific HTTP status codes and messages.
 */
class ExpressError extends Error {
    /**
     * Creates an instance of ExpressError.
     * @param {string} message - The error message to be displayed.
     * @param {number} statusCode - The HTTP status code associated with the error (e.g., 404, 500).
     */
    constructor(message, statusCode) {
        super(); // Call the parent (Error) constructor
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = { ExpressError };
