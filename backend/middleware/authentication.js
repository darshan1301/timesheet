const jwt = require("jsonwebtoken");

const createToken = (user) => {
  const tokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };

  return jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "365d",
  });
};

const isAuthenticated = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    console.log("No token provided");
    return res
      .status(401)
      .json({ message: "Unauthorized: You need to log in first" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.json({ message: "Token not verified please login again." });
    }
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };
    // console.log(decoded);
    next();
  });
};

function authRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      // console.log("AUTH_ROLE", req.user);
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

module.exports = { isAuthenticated, authRole, createToken };
