function checkParametersMiddleware(params) {
  return (req, res, next) => {
    const missingParams = [];
    for (const param of params) {
      if (!(param in req.body)) {
        missingParams.push(param);
      }
    }

    if (missingParams.length > 0) {
      return res.status(400).json({
        message: `Please provide the following parameters: ${missingParams.join(
          ", "
        )}`,
      });
    }

    // All parameters are present, proceed to the next middleware/route handler
    next();
  };
}

module.exports = { checkParametersMiddleware };
