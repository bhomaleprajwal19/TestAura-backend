
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id; // 🟢 store user ID in request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
