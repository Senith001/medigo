const mongoose = require("mongoose");

// Check whether a route param is a valid MongoDB ObjectId.
const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format.`,
      });
    }

    next();
  };
};

module.exports = validateObjectId;
