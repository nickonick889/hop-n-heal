const jwt = require('jsonwebtoken');

// Middleware that protects client-only routes.
// Reads the JWT from the httpOnly cookie set at login.
function authClient(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Reject admin tokens on client routes
    if (decoded.role) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.client = decoded; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authClient;
