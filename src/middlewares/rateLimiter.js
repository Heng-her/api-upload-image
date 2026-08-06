const rateLimit = require("express-rate-limit");
const { blockIP } = require("./ipBlocker");

const windowMinutes = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) || 15;
const maxUploads = parseInt(process.env.RATE_LIMIT_MAX_UPLOADS, 10) || 100;

const uploadRateLimiter = rateLimit({
  windowMs: windowMinutes * 60 * 1000,
  max: maxUploads,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false },
  skip: (req) => {
    const bypassHeader = req.headers["x-api-bypass"];
    const secretBypass = process.env.API_BYPASS_KEY || "crypten-bypass-secret";
    return bypassHeader && bypassHeader === secretBypass;
  },
  handler: (req, res, next, options) => {
    const clientIP = req.ip || req.socket.remoteAddress;
    blockIP(clientIP);

    return res.status(429).json({
      error: `Upload rate limit exceeded (${maxUploads} uploads per ${windowMinutes} minutes). Your IP has been temporarily blocked for ${windowMinutes} minutes.`,
    });
  },
});

module.exports = uploadRateLimiter;
