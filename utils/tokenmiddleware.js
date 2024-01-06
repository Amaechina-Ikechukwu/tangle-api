const checkIfUIDExists = require("./CheckIfUIDExists");

// Middleware function to check for the presence and validity of a token
const checkTokenMiddleware = async (req, res, next) => {
  // Extract the token from the request header, query parameters, or body
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ message: "Unauthorized: Token is missing or invalid" });
    return;
  }

  // Extract the token part after "Bearer "
  const token = authHeader.split("Bearer ")[1];

  // You would typically verify the token against some authentication logic here
  // For example, you might use JWT (JSON Web Tokens) and verify the token

  // For demonstration, let's assume a simple token verification
  const exist = await checkIfUIDExists(token);
  if (!exist) {
    res.status(403).json({ message: "Forbidden: Invalid token" });
    return;
  }

  req.uid = token;
  next();
};
module.exports = {
  checkTokenMiddleware,
};
