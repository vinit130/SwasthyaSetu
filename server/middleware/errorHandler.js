// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('[Error Details]:', err);

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with specified identifier`;
    return res.status(404).json({ success: false, message });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `A record with this ${field} already exists`;
    return res.status(400).json({ success: false, message, duplicateField: field });
  }

  // File Size or Request Entity Too Large Error
  if (err.code === 'LIMIT_FILE_SIZE' || err.type === 'entity.too.large' || err.status === 413) {
    return res.status(400).json({
      success: false,
      message: 'File is too large. Maximum allowed size is 10 MB.',
    });
  }

  // Multer File Type Validation Error
  if (err.message && err.message.includes('Only PDF, JPEG, PNG, and WebP')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return res.status(400).json({ success: false, message });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal server error. Please try again later.',
  });
};

module.exports = errorHandler;
