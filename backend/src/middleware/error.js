export function notFound(req, res) { res.status(404).json({ message: 'Route not found' }); }
export function errorHandler(err, req, res, next) {
  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyPattern || {})[0];
    return res.status(409).json({ message: duplicateField ? `That ${duplicateField} is already in use` : 'That value is already in use' });
  }
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join('. ') });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier' });
  const databaseErrors = ['MongoError', 'MongoServerError', 'MongoNetworkError', 'MongooseError', 'MongooseServerSelectionError', 'MongoServerSelectionError', 'MongoTimeoutError', 'MongoParseError'];
  const databaseError = databaseErrors.includes(err.name);
  const safeDetails = String(err.message || 'Unknown error').replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, 'mongodb://[redacted]');
  console.error(`[${req.method} ${req.originalUrl}] operation=${err.signupOperation || err.loginOperation || 'unknown'} name=${err.name || 'Error'}${err.code ? ` code=${err.code}` : ''}${err.codeName ? ` codeName=${err.codeName}` : ''}: ${safeDetails}`);
  if (databaseError && err.code === 13) return res.status(503).json({ message: 'Database rejected the write. Check the Atlas database user permissions.' });
  if (databaseError) return res.status(503).json({ message: 'Database operation failed. Check the backend database connection and Atlas permissions.' });
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Request could not be completed' });
}
