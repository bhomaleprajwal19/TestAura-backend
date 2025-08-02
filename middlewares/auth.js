const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/blacklistedtoken.model');

module.exports = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const blacklistedToken = await BlacklistedToken.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({ message: 'Token is blacklisted' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();

  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
