// Fallback for routes that don't exist (404)
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Passes the error to the errorHandler below
};

// Global Error Handler
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // 1. Handle Mongoose bad ObjectId (e.g., /api/records/invalid-id-format)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    message = "Resource not found or invalid ID format";
    statusCode = 404;
  }

  // 2. Handle Mongoose duplicate key (e.g., registering with an email that already exists)
  if (err.code === 11000) {
    message = "Duplicate field value entered. Please use another value.";
    statusCode = 400;
  }

  // 3. Handle Mongoose Validation Errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join(", ");
    statusCode = 400;
  }

  // Send standardized JSON response
  res.status(statusCode).json({
    success: false,
    message: message,
    // Only show the stack trace if we are in development mode!
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
