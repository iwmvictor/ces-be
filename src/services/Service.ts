import { Request } from "express";

export class BaseService {
  protected request: Request;
  constructor(private readonly req: Request) {
    this.request = req;
  }
}
