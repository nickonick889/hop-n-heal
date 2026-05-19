const jwt = require('jsonwebtoken');

// Middleware that protects admin-only routes.
// Reads the JWT from the httpOnly cookie set at admin login.
// Optionally pass allowedRoles array to restrict by role, e.g. ['super_admin'].
function authAdmin(allowedRoles = []) {
  return (req, res, next) => {
    const token = req.cookies?.adminToken;

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded.role) {
        return res.status(403).json({ error: 'Forbidden — not an admin token' });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.admin = decoded; // { id, email, role }
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

module.exports = authAdmin;
