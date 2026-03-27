const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const testingMode = process.env.TEST_MODE === "true";

    // Temporary testing bypass
    if (testingMode) {
      req.user = {
        id: "temp-mongo-id",
        userId: req.headers["x-test-userid"] || "patient001",
        email: req.headers["x-test-email"] || "patient@medigo.com",
        role: req.headers["x-test-role"] || "patient",
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
    next();
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
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
