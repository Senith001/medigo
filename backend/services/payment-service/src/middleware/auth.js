const jwt = require("jsonwebtoken");

// Check the user and attach their data to req.user.
const protect = (req, res, next) => {
  try {
    let token;

    // Read the token from the Authorization header.
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token",
      });
    }

    // Verify the token and keep the decoded user on the request.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    // This handles invalid, expired, or malformed tokens.
    return res.status(401).json({
      success: false,
      message: "Not authorized",
      error: error.message,
    });
  }
};

// Allow access only to the given roles.
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient role",
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
