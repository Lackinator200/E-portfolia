// server/auth.js
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET || "changeme_for_school";

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}

// Express middleware: checks Authorization header "Bearer <token>"
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  const token = auth.split(" ")[1];
  const user = verifyToken(token);
  if (!user) return res.status(403).json({ error: "Invalid token" });
  req.user = user;
  next();
}

function requirePerm(perm) {
  return (req, res, next) => {
    const perms = req.user && req.user.perms ? req.user.perms : [];
    if (!perms.includes(perm)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

module.exports = { signToken, verifyToken, authMiddleware, requirePerm };
