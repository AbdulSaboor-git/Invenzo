import jwt from 'jsonwebtoken';

/**
 * withAuth — wraps a Next.js API route handler and enforces JWT authentication.
 *
 * Usage:
 *   export default withAuth(async function handler(req, res) { ... });
 *
 * Optionally restrict to one or more roles:
 *   export default withAuth(handler, ['admin', 'superadmin']);
 *
 * On success, attaches the decoded token payload to req.user so the handler
 * can read req.user.userId, req.user.email, req.user.role, etc.
 */
export function withAuth(handler, allowedRoles = []) {
  return async function authMiddleware(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ success: false, error: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.slice(7); // strip "Bearer "

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({ success: false, error: 'Server misconfiguration' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { userId, email, role, iat, exp }

      // Role guard (optional)
      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ success: false, error: 'Forbidden: insufficient role' });
      }

      return handler(req, res);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Token expired, please log in again' });
      }
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
  };
}
