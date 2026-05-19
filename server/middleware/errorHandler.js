// Central error-handling middleware.
// Express recognises a 4-argument function as an error handler.
// Always mount this LAST in index.js after all routes.
function errorHandler(err, req, res, next) {
  console.error(err.stack || err.message);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ error: message });
}

module.exports = errorHandler;
