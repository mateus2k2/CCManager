// authMiddleware.js

const hardcodedToken = "token";

function authenticateToken(req, res, next) {
  const token = req.headers.authorization;

  if (token === hardcodedToken) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = authenticateToken;

// curl -X GET http://localhost:5015/status \
// -H "Authorization: token"
