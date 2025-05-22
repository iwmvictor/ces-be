import { Request } from "express";

export interface ExpressRequest extends Request {
  user: {
    id: string;
    // Add other properties if needed
  };
}
