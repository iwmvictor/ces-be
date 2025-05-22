import {
  Body,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Route,
  Tags,
  Security,
  Request,
  Middlewares,
} from "tsoa";
import { ResponseService } from "../services/ResponseService";
import {
  CreateResponseDto,
  IResponse,
  TResponse,
} from "../utils/interfaces/common";
import upload from "../utils/cloudinary";
import { appendPhotoAttachments } from "../middlewares/company.middlewares";
import { Request as ExpressRequest } from "express";
import { roles } from "../utils/roles";
import { checkRole } from "../middlewares";
import { appendPhoto } from "../middlewares/company.middlewares";

@Tags("Response")
@Route("/api/response")
export class ResponseController {
  @Get("/")
  public async getResponses(): Promise<IResponse<TResponse[]>> {
    return ResponseService.getAllResponses();
  }

  @Get("/{id}")
  public async getResponseById(
    @Path() id: string,
  ): Promise<IResponse<TResponse | null>> {
    return ResponseService.getResponse(id);
  }

  @Post("/")
  @Security("jwt")
  @Middlewares(
    upload.any(),
    appendPhotoAttachments,
    appendPhoto,
    checkRole(roles.ORGANIZATION),
  )
  public async createResponse(
    @Body() responseData: CreateResponseDto,
    @Request() req: ExpressRequest,
  ): Promise<IResponse<TResponse>> {
    return ResponseService.createResponse(responseData, req);
  }

  @Put("/{id}")
  @Middlewares(
    upload.any(),
    appendPhotoAttachments,
    appendPhoto,
    checkRole(roles.ORGANIZATION),
  )
  public async updateResponse(
    @Path() id: string,
    @Body() responseData: Partial<CreateResponseDto>,
  ): Promise<IResponse<TResponse | null>> {
    return ResponseService.updateResponse(id, responseData);
  }

  @Delete("/{id}")
  public async deleteResponse(@Path() id: string): Promise<IResponse<null>> {
    await ResponseService.deleteResponse(id);
    return {
      statusCode: 200,
      message: "Response deleted successfully",
    };
  }
}
