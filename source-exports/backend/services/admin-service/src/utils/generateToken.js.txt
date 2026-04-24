import jwt from "jsonwebtoken";

const generateToken = (user) => {
  // 🔑 Key Difference: Checks if the user object is coming from the Auth DB (_id) or the local Admin DB (authUserId)
  const id = user._id || user.authUserId;

  return jwt.sign(
    {
      id: id,
      userId: user.userId,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }
  );
};

export default generateToken;