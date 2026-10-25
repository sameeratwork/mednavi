import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory rate limiting map keyed by client IP
const ipRecords = new Map<string, RateLimitRecord>();

// Clean up stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    ipRecords.forEach((record, ip) => {
      if (now > record.resetAt) {
        ipRecords.delete(ip);
      }
    });
  }, 5 * 60 * 1000);
}

/**
 * Extracts client IP from standard proxy headers or fallback
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Checks whether the client IP has exceeded the allowed rate limit.
 * @param req NextRequest
 * @param maxRequests Maximum requests within the window (default: 30)
 * @param windowMs Time window in milliseconds (default: 60,000ms = 1 minute)
 */
export function checkRateLimit(
  req: NextRequest,
  maxRequests = 30,
  windowMs = 60 * 1000
): { allowed: boolean; remaining: number; resetAfterSeconds: number } {
  const ip = getClientIp(req);
  const now = Date.now();

  let record = ipRecords.get(ip);
  if (!record || now > record.resetAt) {
    record = {
      count: 1,
      resetAt: now + windowMs,
    };
    ipRecords.set(ip, record);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  record.count += 1;
  const resetAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));

  if (record.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAfterSeconds,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAfterSeconds,
  };
}
