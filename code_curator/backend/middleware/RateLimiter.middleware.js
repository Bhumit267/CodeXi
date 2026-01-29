const rateLimit = require('express-rate-limit');

const RateLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 5, // limit each IP to 5 password update requests per windowMs
    message: 'Too many requests from this IP, please try again after 2 minutes'
});

module.exports = {RateLimiter}