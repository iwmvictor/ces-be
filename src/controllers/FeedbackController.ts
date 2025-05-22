import {
  Body,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Route,
  Tags,
  Request,
  Middlewares,
  Security,
} from "tsoa";
import { FeedbackService } from "../services/FeedbackService";
import {
  CreateFeedbackDto,
  IResponse,
  TFeedback,
} from "../utils/interfaces/common";
import upload from "../utils/cloudinary";
import { appendPhotoAttachments } from "../middlewares/company.middlewares";
import { Request as ExpressRequest } from "express";
import { roles } from "../utils/roles";
import { checkRole } from "../middlewares";

@Tags("Feedback")
@Route("/api/feedback")
export class FeedbackController {
  @Get("/")
  public async getFeedbacks(): Promise<IResponse<TFeedback[]>> {
    return FeedbackService.getAllFeedbacks();
  }

  @Security("jwt")
  @Middlewares(checkRole(roles.ORGANIZATION))
  @Get("/organization")
  public async getFeedbacksForOrganization(
    @Request() req: ExpressRequest,
  ): Promise<IResponse<TFeedback[]>> {
    return FeedbackService.getFeedbacksForOrganization(req);
  }

  @Security("jwt")
  @Middlewares(checkRole(roles.CITIZEN))
  @Get("/citizen")
  public async getFeedbacksForCitizen(
    @Request() req: ExpressRequest,
  ): Promise<IResponse<TFeedback[]>> {
    return FeedbackService.getFeedbacksForCitizen(req);
  }

  @Post("/")
  @Security("jwt")
  @Middlewares(upload.any(), appendPhotoAttachments, checkRole(roles.CITIZEN))
  public async createFeedback(
    @Body() feedbackData: CreateFeedbackDto,
    @Request() req: ExpressRequest,
  ): Promise<IResponse<TFeedback>> {
    return FeedbackService.createFeedback(feedbackData, req);
  }

  @Get("/{id}")
  public async getFeedbackById(
    @Path() id: string,
  ): Promise<IResponse<TFeedback | null>> {
    return FeedbackService.getFeedback(id);
  }

  @Put("/{id}")
  @Middlewares(upload.any(), appendPhotoAttachments)
  public async updateFeedback(
    @Path() id: string,
    @Body() feedbackData: Partial<CreateFeedbackDto>,
  ): Promise<IResponse<TFeedback | null>> {
    return FeedbackService.updateFeedback(id, feedbackData);
  }

  @Put("/{id}/cancel")
  @Security("jwt")
  @Middlewares(checkRole(roles.ORGANIZATION))
  public async cancelFeedback(
    @Path() id: string,
  ): Promise<IResponse<TFeedback>> {
    return FeedbackService.cancelFeedback(id);
  }

  @Delete("/{id}")
  public async deleteFeedback(@Path() id: string): Promise<IResponse<null>> {
    await FeedbackService.deleteFeedback(id);
    return {
      statusCode: 200,
      message: "Feedback deleted successfully",
    };
  }
}
