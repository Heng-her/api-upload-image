const apiKey = (req, res, next) => {
  const expectedKey = process.env.API_KEY;

  // If no API_KEY environment variable is configured on the server, skip authentication
  if (!expectedKey) {
    return next();
  }

  const clientKey = req.headers['x-api-key'] || req.query.api_key;

  if (!clientKey || clientKey !== expectedKey) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or missing API key.'
    });
  }

  next();
};

module.exports = apiKey;
