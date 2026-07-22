const apiKey = (req, res, next) => {
  const expectedKey = process.env.API_KEY;
  const clientKey = req.headers['x-api-key'] || req.query.api_key;

  if (!expectedKey || !clientKey || clientKey !== expectedKey) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or missing API key.'
    });
  }

  next();
};

module.exports = apiKey;
