import AppError from "../utils/error";
import { prisma } from "../utils/client";
import {
  CreateResponseDto,
  IResponse,
  TResponse,
} from "../utils/interfaces/common";
import type { Request } from "express";

export class ResponseService {
  static async getAllResponses(): Promise<IResponse<TResponse[]>> {
    const responses = await prisma.response.findMany({
      include: {
        feedback: true,
        organization: true,
      },
    });
    return {
      statusCode: 200,
      message: "Responses retrieved successfully",
      data: responses,
    };
  }

  static async getResponse(id: string): Promise<IResponse<TResponse>> {
    const response = await prisma.response.findUnique({
      where: { id },
      include: {
        feedback: true,
        organization: true,
      },
    });
    if (!response) {
      throw new AppError("response not found", 404);
    }
    return {
      statusCode: 200,
      message: "Response retrieved successfully",
      data: response,
    };
  }

  public static async createResponse(
    responseData: CreateResponseDto,
    req: Request,
  ): Promise<IResponse<TResponse>> {
    const org = await prisma.organization.findFirst({
      where: { userId: req.user!.id },
    });

    if (!org) {
      throw new AppError("Organization not found for the user", 404);
    }

    const response = await prisma.response.create({
      data: {
        subject: responseData.subject,
        feedbackId: responseData.feedbackId,
        organizationId: org.id,
        description: responseData.description,
        photo:
          typeof responseData.photo === "string"
            ? responseData.photo
            : undefined,
      },
    });

    // Update feedback status and response status
    await prisma.feedback.update({
      where: { id: responseData.feedbackId },
      data: {
        feedbackStatus: "RESOLVED",
        responseStatus: "ANSWERED",
      },
    });

    return {
      statusCode: 201,
      message: "Response created successfully",
      data: response,
    };
  }

  static async deleteResponse(id: string): Promise<void> {
    await prisma.response.delete({ where: { id } });
  }
}
