import { BaseService } from "./Service";
import { prisma } from "../utils/client";
import {
  CreateFeedbackDto,
  IResponse,
  TFeedback,
} from "../utils/interfaces/common";
import AppError from "../utils/error";
import { determineBestOrganizations, extractTags } from "../utils/helpers";
import type { Request } from "express";

function generateTicket(): string {
  const ticket = Array.from({ length: 12 }, (_, i) =>
    i % 2 === 0
      ? String.fromCharCode(65 + Math.floor(Math.random() * 26)) // Letter
      : Math.floor(Math.random() * 10),
  ).join("");
  return ticket;
}

export class FeedbackService extends BaseService {
  public static async createFeedback(
    feedbackData: CreateFeedbackDto,
    req: Request,
  ): Promise<IResponse<TFeedback>> {
    try {
      const derivedTags = extractTags(feedbackData.description);
      const organizations = await prisma.organization.findMany();

      const bestMatches = determineBestOrganizations(
        organizations,
        feedbackData.category,
        derivedTags,
        3,
      );

      const ticket = generateTicket();

      const feedback = await prisma.feedback.create({
        data: {
          userId: req.user!.id,
          category: feedbackData.category,
          description: feedbackData.description,
          location: feedbackData.location,
          galleryImages: feedbackData.galleryImages || [],
          phoneNumber: feedbackData.phoneNumber,
          organizationIds: bestMatches.map((m) => m.organization.id),
          ticket,
        },
      });

      return {
        statusCode: 201,
        message: "Feedback created successfully",
        data: feedback,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async updateFeedback(
    feedbackId: string,
    feedbackData: Partial<CreateFeedbackDto>,
  ): Promise<IResponse<TFeedback>> {
    try {
      const existingFeedback = await prisma.feedback.findUnique({
        where: { id: feedbackId },
      });

      if (!existingFeedback) {
        throw new AppError("Feedback not found", 404);
      }

      const feedback = await prisma.feedback.update({
        where: { id: feedbackId },
        data: feedbackData,
      });
      return {
        statusCode: 200,
        message: "Feedback updated successfully",
        data: feedback,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getFeedback(
    feedbackId: string,
  ): Promise<IResponse<TFeedback>> {
    try {
      const feedback = await prisma.feedback.findUnique({
        where: { id: feedbackId },
        include: {
          response: {
            include: {
              organization: true,
            },
          },
        },
      });

      if (!feedback) {
        throw new AppError("Feedback not found", 404);
      }
      return {
        statusCode: 200,
        message: "Feedback fetched successfully",
        data: feedback,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getAllFeedbacks(): Promise<IResponse<TFeedback[]>> {
    try {
      const feedbacks = await prisma.feedback.findMany({
        include: {
          response: {
            include: {
              organization: true,
            },
          },
        },
      });
      return {
        statusCode: 200,
        message: "Feedbacks fetched successfully",
        data: feedbacks,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async deleteFeedback(
    feedbackId: string,
  ): Promise<IResponse<null>> {
    try {
      await prisma.feedback.delete({ where: { id: feedbackId } });
      return {
        statusCode: 200,
        message: "Feedback deleted successfully",
        data: null,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getFeedbacksForOrganization(
    req: Request,
  ): Promise<IResponse<TFeedback[]>> {
    const org = await prisma.organization.findFirst({
      where: { userId: req.user!.id },
    });

    if (!org) {
      throw new Error("Organization not found for the user");
    }

    const feedbacks = await prisma.feedback.findMany({
      where: {
        organizationIds: {
          has: org.id,
        },
      },
      include: {
        response: {
          include: {
            organization: true,
          },
        },
      },
    });

    return {
      statusCode: 200,
      message: "Feedbacks retrieved successfully",
      data: feedbacks,
    };
  }

  public static async getFeedbacksForCitizen(
    req: Request,
  ): Promise<IResponse<TFeedback[]>> {
    const feedbacks = await prisma.feedback.findMany({
      where: {
        userId: req.user!.id,
      },
      include: {
        response: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!feedbacks) {
      throw new Error("feedbacks not found for the user");
    }

    return {
      statusCode: 200,
      message: "Feedbacks retrieved successfully",
      data: feedbacks,
    };
  }

  public static async cancelFeedback(
    id: string,
  ): Promise<IResponse<TFeedback>> {
    const feedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      throw new AppError("Feedback not found", 404);
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        feedbackStatus: "UNRESOLVED",
        responseStatus: "CLOSED",
      },
    });

    return {
      statusCode: 200,
      message: "Feedback canceled successfully",
      data: updatedFeedback,
    };
  }
}
