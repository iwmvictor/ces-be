/* eslint-disable no-async-promise-executor */

import type * as express from "express";
import { prisma } from "./client";
import AppError from "./error";
import type { TUser } from "./interfaces/common";
import { verifyToken } from "./jwt";

export const expressAuthentication = (
  request: express.Request,
  securityName: string,
) => {
  if (securityName === "jwt") {
    const token = request.headers["authorization"] as string;
    return new Promise(async (resolve, reject) => {
      try {
        if (!token) {
          reject(new AppError("No token provided", 401));
          return;
        }
        const email = (await verifyToken(token)) as string;
        const user = await prisma.user.findFirst({
          where: { email },
          include: {
            roles: true,
          },
        });

        request.user = user as TUser;
        resolve(user);
      } catch (error) {
        reject(new AppError("Not Authorized", 403));
      }
    });
  }
};
