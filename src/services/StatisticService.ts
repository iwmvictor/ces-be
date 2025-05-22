/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../utils/client";
import { IResponse } from "../utils/interfaces/common";
import AppError from "../utils/error";
import type { Request } from "express";

export class StatisticService {
  public static async getAdminStatisticsByMonth(
    year: number,
  ): Promise<IResponse<any>> {
    try {
      const [organization, citizen, feedback] = await Promise.all([
        prisma.user.findMany({
          where: {
            createdAt: {
              gte: new Date(`${year}-01-01`),
              lt: new Date(`${year + 1}-01-01`),
            },
            roles: {
              some: {
                role: "ORGANIZATION",
              },
            },
          },
          select: {
            createdAt: true,
          },
        }),
        prisma.user.findMany({
          where: {
            createdAt: {
              gte: new Date(`${year}-01-01`),
              lt: new Date(`${year + 1}-01-01`),
            },
            roles: {
              some: {
                role: "CITIZEN",
              },
            },
          },
          select: {
            createdAt: true,
          },
        }),

        prisma.feedback.findMany({
          where: {
            createdAt: {
              gte: new Date(`${year}-01-01`),
              lt: new Date(`${year + 1}-01-01`),
            },
          },
          select: {
            createdAt: true,
          },
        }),
      ]);

      const organizationCountByMonth = Array(12).fill(0);
      const citizenCountByMonth = Array(12).fill(0);
      const feedbackCountByMonth = Array(12).fill(0);

      organization.forEach((org) => {
        const month = new Date(org.createdAt).getMonth();
        organizationCountByMonth[month]++;
      });

      citizen.forEach((cit) => {
        const month = new Date(cit.createdAt).getMonth();
        citizenCountByMonth[month]++;
      });

      feedback.forEach((feed) => {
        const month = new Date(feed.createdAt).getMonth();
        feedbackCountByMonth[month]++;
      });

      return {
        message: "Statistics by month fetched successfully",
        statusCode: 200,
        data: {
          organizationCountByMonth,
          citizenCountByMonth,
          feedbackCountByMonth,
          totalOrganizations: organization.length,
          totalCitizens: citizen.length,
          totalFeedbacks: feedback.length,
        },
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getCitizenStatisticsByMonth(
    year: number,
    req: Request,
  ): Promise<IResponse<any>> {
    try {
      const feedbacks = await prisma.feedback.findMany({
        where: {
          userId: req.user!.id,
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
      });

      const feedbackCountByMonth = Array(12).fill(0);
      const resolvedFeedbackCountByMonth = Array(12).fill(0);
      const unresolvedFeedbackCountByMonth = Array(12).fill(0);

      feedbacks.forEach((feedback) => {
        const month = new Date(feedback.createdAt).getMonth();
        feedbackCountByMonth[month]++;
        if (feedback.feedbackStatus === "RESOLVED") {
          resolvedFeedbackCountByMonth[month]++;
        } else {
          unresolvedFeedbackCountByMonth[month]++;
        }
      });

      return {
        message: "Citizen statistics by month fetched successfully",
        statusCode: 200,
        data: {
          feedbackCountByMonth,
          resolvedFeedbackCountByMonth,
          unresolvedFeedbackCountByMonth,
          totalFeedbacks: feedbacks.length,
          totalResolvedFeedbacks: resolvedFeedbackCountByMonth.reduce(
            (a, b) => a + b,
            0,
          ),
          totalUnresolvedFeedbacks: unresolvedFeedbackCountByMonth.reduce(
            (a, b) => a + b,
            0,
          ),
        },
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getOrganizationStatisticsByMonth(
    year: number,
    req: Request,
  ): Promise<IResponse<any>> {
    try {
      const org = await prisma.organization.findFirst({
        where: { userId: req.user!.id },
      });

      if (!org) {
        throw new AppError("Organization not found for the user", 404);
      }

      const feedbacks = await prisma.feedback.findMany({
        where: {
          organizationIds: {
            has: org.id,
          },
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
      });

      const feedbackCountByMonth = Array(12).fill(0);
      const answeredFeedbackCountByMonth = Array(12).fill(0);
      const pendingFeedbackCountByMonth = Array(12).fill(0);

      feedbacks.forEach((feedback) => {
        const month = new Date(feedback.createdAt).getMonth();
        feedbackCountByMonth[month]++;
        if (feedback.responseStatus === "ANSWERED") {
          answeredFeedbackCountByMonth[month]++;
        } else if (feedback.responseStatus === "PENDING") {
          pendingFeedbackCountByMonth[month]++;
        }
      });

      return {
        message: "Organization statistics by month fetched successfully",
        statusCode: 200,
        data: {
          feedbackCountByMonth,
          answeredFeedbackCountByMonth,
          pendingFeedbackCountByMonth,
          totalFeedbacks: feedbacks.length,
          totalAnsweredFeedbacks: answeredFeedbackCountByMonth.reduce(
            (a, b) => a + b,
            0,
          ),
          totalPendingFeedbacks: pendingFeedbackCountByMonth.reduce(
            (a, b) => a + b,
            0,
          ),
        },
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }
}
