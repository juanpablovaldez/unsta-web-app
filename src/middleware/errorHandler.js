'use strict';

const { AppError } = require('../errors');

function notFoundHandler(req, res, next) {
  const isApi = req.originalUrl.startsWith('/api');
  if (isApi) {
    return res.status(404).json({ error: { message: 'Route not found', statusCode: 404 } });
  }
  res.status(404).render('index', { error: 'Page not found.' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isApi = req.originalUrl.startsWith('/api');

  // Mongoose invalid ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    if (isApi) {
      return res.status(400).json({ error: { message: 'Invalid ID format', statusCode: 400 } });
    }
    return res.redirect('/');
  }

  // Operational (known) errors
  if (err.isOperational) {
    if (isApi) {
      return res.status(err.statusCode).json({
        error: { message: err.message, statusCode: err.statusCode },
      });
    }
    return res.status(err.statusCode).render('index', { error: err.message });
  }

  // Unexpected errors
  console.error('Unexpected error:', err);
  if (isApi) {
    return res.status(500).json({ error: { message: 'Internal server error', statusCode: 500 } });
  }
  res.status(500).render('index', { error: 'Something went wrong. Please try again.' });
}

module.exports = { notFoundHandler, errorHandler };
