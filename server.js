const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./config/db');

const app = express();

const allowedOrigins = [
  'https://attend-track-frontend.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Diagnostic log for production
console.log('Production check:', {
  hasMongo: !!process.env.MONGO_URI,
  hasJwt: !!process.env.JWT_SECRET,
  port: process.env.PORT
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));