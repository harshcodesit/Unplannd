// utils/catchAsync.js

/**
 * A utility function to wrap asynchronous Express route handlers.
 * It catches any errors that occur within the async function and passes them to the next middleware
 * (which should be your global error handling middleware).
 * This prevents you from having to write try-catch blocks in every async route handler.
 *
 * @param {Function} func - The asynchronous function (Express route handler) to wrap.
 * @returns {Function} A new function that executes the original function and catches any errors.
 */
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next); // Execute the function and catch any promise rejections, passing them to next()
    }
}
