/**
 * Express global error handler middleware.
 * Mount LAST in index.js: app.use(errorHandler)
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  console.error("[errorHandler]", err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
};

module.exports = errorHandler;
