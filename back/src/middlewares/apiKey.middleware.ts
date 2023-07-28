import { HttpException } from '@exceptions/httpException';
import { NextFunction, Request, Response } from 'express';
import { API_KEY, NODE_ENV } from '@config';

const blacklist = new Map<string, number>();

/**
 * @name ApiKeyMiddleware
 *
 * Very simple API key protection.
 */
export const ApiKeyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (NODE_ENV === 'test') return next();

  const expectedKey = API_KEY;

  const clientIP = req.ip;

  if (blacklist.get(clientIP) >= 100) {
    // If the same IP tried 100 wrong API keys, it gets blacklisted.
    return next(new HttpException(403, 'IP blacklisted'));
  }

  if (!expectedKey) {
    throw new Error('Application cannot work without an API key! Contact a developper.');
  }

  const givenKey = req.header('Authorization');

  if (expectedKey !== givenKey) {
    if (!blacklist.has(clientIP)) blacklist.set(clientIP, 0);
    blacklist.set(clientIP, blacklist.get(clientIP) + 1);

    return next(new HttpException(403, 'Wrong API Key'));
  }

  if (blacklist.has(clientIP)) blacklist.set(clientIP, 0);

  next();
};
