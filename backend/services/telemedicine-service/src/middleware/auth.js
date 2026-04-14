const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const testingMode = process.env.TEST_MODE === "true";

    // Temporary development-only bypass for local API testing.
    if (testingMode) {
      req.user = {
        id: "temp-mongo-id",
        userId: req.headers["x-test-userid"] || "doctor001",
        email: req.headers["x-test-email"] || "doctor@medigo.com",
        role: req.headers["x-test-role"] || "doctor",
      };

      return next();
    }

    let token;

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
      error: error.message,
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient role",
      });
    }

    return next();
  };
};

module.exports = {
  protect,
  authorize,
};
