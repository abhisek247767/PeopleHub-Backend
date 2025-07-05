const jwt = require('jsonwebtoken');
const user = require("../models/userSchema");

const authenticate = (roles = []) => {
  return async (req, res, next) => {
    try {
      let token = req.cookies.authToken || req.headers.authorization;

      if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
      }
      if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'No token provided, authentication failed.' });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          const refreshToken = req.cookies.refreshToken;
          if (!refreshToken) {
            console.log('Token expired and no refresh token provided');
            return res.status(401).json({ message: 'Token expired and no refresh token provided.' });
          }

          const newTokens = await refreshToken(refreshToken); // Implement this function
          res.cookie('authToken', newTokens.authToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
          res.cookie('refreshToken', newTokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });

          decoded = jwt.verify(newTokens.authToken, process.env.JWT_SECRET);
        } else {
          throw error;
        }
      }

      req.user = decoded;

      // Role-based access control
      if (roles.length && !roles.includes(decoded.role)) {
        console.log(`User ${decoded.userId} attempted to access restricted resource`);
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }

      console.log(`User ${decoded.userId} authenticated successfully`);
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        console.log('Invalid token');
        return res.status(401).json({ message: 'Invalid token' });
      } else {
        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'Server error during authentication' });
      }
    }
  };
};

module.exports = { authenticate };
