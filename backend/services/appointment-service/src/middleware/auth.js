import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JWT and attach user info to request.
 * Compatible with MEDIGO auth-service token structure.
 * Token must be sent as: Authorization: Bearer <token>
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Authorization denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Normalize user fields ─────────────────────────────────
    // Auth service stores full user object in DB, token has { id, ... }
    // We normalize here so controller always uses:
    //   req.user.id    → patient/doctor ID
    //   req.user.name  → full name
    //   req.user.email → email
    //   req.user.role  → role
    // MEDIGO token payload: { id, userId, fullName, email, role }
    // fullName might not be in token yet — fallback to email prefix
    req.user = {
      id:    decoded.id,
      name:  decoded.fullName || decoded.name || decoded.email.split('@')[0],
      email: decoded.email,
      role:  decoded.role,
      phone: decoded.phone || null,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

/**
 * Restrict access to specific roles.
 * Usage: authorize('patient') or authorize('patient', 'doctor')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }
    next();
  };
};

export { authenticate, authorize };
