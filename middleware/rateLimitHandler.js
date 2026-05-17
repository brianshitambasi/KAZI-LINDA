const rateLimit = require('express-rate-limit');

const rateLimitHandler = (req, res) => {
  res.status(429).json({
    message: 'Too many requests, please try again later.',
    retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
  });
};

module.exports = { rateLimitHandler };
