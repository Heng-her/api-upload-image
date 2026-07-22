const blockedIPs = new Map();
const BLOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

const blockIP = (ip) => {
  blockedIPs.set(ip, Date.now() + BLOCK_DURATION_MS);
};

const ipBlocker = (req, res, next) => {
  const clientIP = req.ip || req.socket.remoteAddress;

  if (blockedIPs.has(clientIP)) {
    const expireTime = blockedIPs.get(clientIP);
    if (Date.now() < expireTime) {
      return res.status(403).json({
        error: 'Your IP has been temporarily blocked.'
      });
    } else {
      blockedIPs.delete(clientIP);
    }
  }

  next();
};

module.exports = {
  ipBlocker,
  blockIP
};
