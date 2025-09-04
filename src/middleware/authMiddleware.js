const jwt = require('jsonwebtoken');
const User = require("../models/userSchema");

const authenticate = (roles = []) => {
  return async (req, res, next) => {
    try {
      let token;
      if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        token = req.headers.authorization.split(' ')[1];
      }else if(req.cookies.authToken){
        token = req.cookies.authToken;
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
          // There is no refreshToken is present in the form of cookies -> make changes on index.js file 
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

      // Fetch full user data for services that need it
      try {
        const userId = decoded.userId || decoded.id || decoded._id;
        if (userId) {
          const fullUser = await User.findById(userId);
          if (fullUser) {
            req.user = { ...decoded, ...fullUser.toJSON(), _id: fullUser._id };
          }
        }
      } catch (userFetchError) {
        console.warn('Could not fetch full user data:', userFetchError.message);
      }

      // Role-based access control
      const userRole = req.user.role || decoded.role;
      if (roles.length && !roles.includes(userRole)) {
        const userId = req.user._id || req.user.userId || req.user.id;
        console.log(`User ${userId} with role ${userRole} attempted to access restricted resource requiring roles: ${roles.join(', ')}`);
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      }

      const userId = req.user._id || req.user.userId || req.user.id;
      console.log(`User ${userId} authenticated successfully with role: ${userRole}`);
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
