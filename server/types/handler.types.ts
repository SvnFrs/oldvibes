import type { NextFunction, Request, Response } from "express";

export type RequestHandler = (
  req: Request,
  res: Response,
  next?: NextFunction,
) => Promise<void | never> | void | never;
