import type { NextFunction, Request, Response } from "express";

export async function loggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(`new request at: ${req.url} , body`, req.body);
  next();
}
