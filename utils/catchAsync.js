// glimmergrid-mvp/utils/catchAsync.js

// This utility function wraps an asynchronous Express route handler.
// It catches any errors (including rejected Promises) and passes them to Express's
// error-handling middleware (via 'next(err)').
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    };
};
