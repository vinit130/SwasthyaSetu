const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

const path = require('path');
const fs = require('fs');

// Body parser
app.use(express.json());

// Enable CORS for frontend and deployment domains
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      callback(null, true);
    },
    credentials: true,
  })
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const isConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'ok',
    project: 'SwasthyaSetu Rural Healthcare Platform',
    database: isConnected ? 'Connected (MongoDB)' : 'In-Memory Demo Mode',
    dbReadyState: mongoose.connection.readyState,
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/risk', require('./routes/riskRoutes'));
app.use('/api/referrals', require('./routes/referralRoutes'));
app.use('/api/followups', require('./routes/followupRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Serve client in production or if dist build exists
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[SwasthyaSetu Server] running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
});

module.exports = app;
