// Middlewares/verifyRole.js

const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role; // protect middleware se aata hai
    if (allowedRoles.includes(userRole)) {
      return next(); // aage jao
    } else {
      return res.status(403).json({
        message: "Access denied: You don't have permission",
      });
    }
  };
};

export { verifyRole };
