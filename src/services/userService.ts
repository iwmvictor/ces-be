/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../utils/client";
import {
  IUser,
  IResponse,
  ILoginUser,
  ISignUpUser,
  RoleT,
  CreateUser,
} from "../utils/interfaces/common";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/error";
import { randomBytes } from "crypto";
import { sendEmail } from "../utils/email";
import { hash } from "bcrypt";
import { roles } from "../utils/roles";
import type { Request } from "express";

export class UserService {
  public static async getUsers(): Promise<IResponse<IUser[]>> {
    try {
      const users = await prisma.user.findMany({
        include: {
          roles: true,
        },
      });
      return {
        message: "welcome",
        statusCode: 200,
        data: users,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async loginUser(user: ILoginUser) {
    try {
      const userData = await prisma.user.findFirst({
        where: { email: user.email },
        include: {
          roles: true,
        },
      });
      if (!userData) {
        throw new AppError("user account not found ", 401);
      }

      const isPasswordSimilar = await compare(user.password, userData.password);
      if (isPasswordSimilar) {
        const token = jwt.sign(user.email, process.env.JWT_SECRET!);
        const userRoles = userData.roles.map((roleRecord) => roleRecord.role);
        return {
          message: "",
          statusCode: 200,
          data: {
            token,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            id: userData.id,
            roles: userRoles,
            photo: userData.photo,
          },
        };
      }
      throw new AppError("user account with email or password not found", 401);
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  // user signup
  public static async signUpUser(user: ISignUpUser) {
    try {
      // Check if user already exists
      const userExists = await prisma.user.findFirst({
        where: { email: user.email },
      });
      if (userExists) {
        throw new AppError("User already exists", 409);
      }

      // Hash password
      const hashedPassword = await hash(user.password, 10);
      const token = jwt.sign(user.email, process.env.JWT_SECRET!);
      await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            password: hashedPassword,
            photo: typeof user.photo === "string" ? user.photo : undefined,
          },
        });

        if (!createdUser) {
          throw new Error("Failed to create user");
        }

        // Assign the "USER" role
        const assignRole = await tx.userRoles.create({
          data: {
            userId: createdUser.id,
            role: roles.CITIZEN,
          },
        });

        if (!assignRole) {
          throw new Error("Failed to assign role to user");
        }
      });

      const pt = await prisma.user.findFirst({
        where: { email: user.email },
      });

      return {
        message: "User created successfully",
        data: {
          token,
          photo: pt?.photo,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: [roles.CITIZEN],
        },
        statusCode: 201,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async createUser(user: CreateUser): Promise<IResponse<IUser>> {
    try {
      // Check if user already exists
      const userExists = await prisma.user.findFirst({
        where: { email: user.email },
      });
      if (userExists) {
        throw new AppError("User already exists", 409);
      }

      // Hash password
      const hashedPassword = await hash(user.password, 10);

      // Create user and assign role in a transaction
      const createdUser = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            email: user.email,
            password: hashedPassword,
            photo: typeof user.photo === "string" ? user.photo : undefined,
          },
        });

        await tx.userRoles.create({
          data: {
            userId: newUser.id,
            role: user.role,
          },
        });

        return newUser;
      });

      return {
        message: "User created successfully",
        statusCode: 201,
        data: createdUser,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  // Method to request otp
  public static async requestPasswordReset(email: string) {
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Generate a 6-digit OTP
    const otp = randomBytes(3).toString("hex").toUpperCase();
    const otpExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Update the user with OTP and expiration time
    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiresAt },
    });

    // Send OTP via email (implement sendEmail utility)
    await sendEmail({
      to: user.email,
      subject: "Password Reset - One-Time Password (OTP)",
      body: `
    Dear ${user.firstName || "User"},

    You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed with the password reset process:

    OTP: ${otp}

    This OTP is valid for a limited time. If you did not request a password reset, please disregard this email.

    Best regards,
    Citizen Complaints and Engagement System Support Team
  `,
    });

    return { message: "OTP sent to your email " };
  }

  // Method to reset password
  public static async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ) {
    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (
      !user.otp ||
      user.otp !== otp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10);

    // Update the user with the new password and clear OTP fields
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, otp: null, otpExpiresAt: null },
    });

    return { message: "Password reset successfully" };
  }
  public static async deleteUser(id: string) {
    try {
      // Check if the user exists and include related records
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          roles: true,
        },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      await prisma.$transaction(async (tx) => {
        // Delete the user's roles
        await tx.userRoles.deleteMany({
          where: { userId: id },
        });

        // Delete the user
        await tx.user.delete({
          where: { id },
        });
      });

      return { message: "User and related activities deleted successfully" };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getMe(req: Request) {
    try {
      const userId = req.user!.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: true,
        },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      const userRoles = user.roles.map((roleRecord) => roleRecord.role);
      return {
        message: "User fetched successfully",
        statusCode: 200,
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roles: userRoles,
          photo: user.photo,
          phoneNumber: user.phoneNumber,
        },
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getUserById(id: string): Promise<IResponse<IUser>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          roles: true,
          organization: true,
        },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      return {
        message: "User fetched successfully",
        statusCode: 200,
        data: user,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async updateUser(
    id: string,
    user: Partial<ISignUpUser> & { role?: RoleT },
  ): Promise<IResponse<IUser>> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { id },
        include: { roles: true },
      });

      if (!existingUser) {
        throw new AppError("User not found", 404);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          photo: typeof user.photo === "string" ? user.photo : undefined,
        },
      });

      if (user.role) {
        // Update the user's role
        await prisma.userRoles.updateMany({
          where: { userId: id },
          data: { role: user.role },
        });
      }

      return {
        message: "User updated successfully",
        statusCode: 200,
        data: updatedUser,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getDrivers(): Promise<IResponse<IUser[]>> {
    try {
      const drivers = await prisma.user.findMany({
        where: {
          roles: {
            some: {
              role: roles.CITIZEN,
            },
          },
        },
        include: {
          roles: true,
        },
      });

      return {
        message: "Citizen fetched successfully",
        statusCode: 200,
        data: drivers,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }
}
