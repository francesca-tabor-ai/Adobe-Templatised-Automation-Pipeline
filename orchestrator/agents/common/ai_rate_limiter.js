/**
 * Token-bucket rate limiter for AI API calls.
 * Prevents exceeding provider rate limits by delaying requests.
 */

/**
 * @param {number} requestsPerMinute - Max requests per minute
 */
function RateLimiter(requestsPerMinute) {
  this.requestsPerMinute = requestsPerMinute || 60;
  this.intervalMs = 60000 / this.requestsPerMinute;
  this.lastRequestTime = 0;
}

/**
 * Wait until it's safe to make the next request.
 * @returns {Promise<void>}
 */
RateLimiter.prototype.acquire = function () {
  var self = this;
  var now = Date.now();
  var elapsed = now - self.lastRequestTime;
  var waitMs = Math.max(0, self.intervalMs - elapsed);

  return new Promise(function (resolve) {
    if (waitMs <= 0) {
      self.lastRequestTime = now;
      resolve();
    } else {
      setTimeout(function () {
        self.lastRequestTime = Date.now();
        resolve();
      }, waitMs);
    }
  });
};

module.exports = { RateLimiter: RateLimiter };
