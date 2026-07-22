const rateLimit = require("express-rate-limit");
const { blockIP } = require("./ipBlocker");

const uploadRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  handler: (req, res, next, options) => {
    const clientIP = req.ip || req.socket.remoteAddress;
    blockIP(clientIP);

    return res.status(403).json({
      error: "Your IP has been temporarily blocked.",
    });
  },
});

module.exports = uploadRateLimiter;
