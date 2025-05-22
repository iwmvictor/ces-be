import {
  Body,
  Get,
  Middlewares,
  Post,
  Put,
  Route,
  Security,
  Tags,
  Path,
  Delete,
  Request,
} from "tsoa";
import { UserService } from "../services/userService";
import type {
  ILoginUser,
  ISignUpUser,
  CreateUser,
} from "../utils/interfaces/common";
import { loggerMiddleware } from "../utils/loggers/loggingMiddleware";
import { Request as ExpressRequest } from "express";
import { appendPhoto } from "../middlewares/company.middlewares";
import upload from "../utils/cloudinary";

@Tags("Authentication")
@Route("/api/auth")
export class UserController {
  @Get("/users")
  @Middlewares(loggerMiddleware)
  public getUser() {
    return UserService.getUsers();
  }

  @Get("/users/{id}")
  @Security("jwt")
  @Middlewares(loggerMiddleware)
  public getUserById(@Path() id: string) {
    return UserService.getUserById(id);
  }

  //delete user
  @Delete("/delete/{id}")
  @Security("jwt")
  @Middlewares(loggerMiddleware)
  public deleteUser(@Path() id: string) {
    return UserService.deleteUser(id);
  }

  @Post("/request-password-reset")
  public async requestPasswordReset(@Body() body: { email: string }) {
    const { email } = body;
    return UserService.requestPasswordReset(email);
  }

  @Post("/reset-password")
  public async resetPassword(
    @Body() body: { email: string; otp: string; newPassword: string },
  ) {
    const { email, otp, newPassword } = body;
    return UserService.resetPassword(email, otp, newPassword);
  }

  @Post("signin")
  public loginUser(@Body() user: ILoginUser) {
    return UserService.loginUser(user);
  }

  //user signup
  @Post("/signup")
  @Middlewares(upload.any(), appendPhoto)
  public async signup(@Body() user: ISignUpUser) {
    return UserService.signUpUser(user);
  }

  @Post("/create")
  @Security("jwt")
  @Middlewares(upload.any(), appendPhoto)
  public async createUser(@Body() user: CreateUser) {
    if (!user.role) {
      throw new Error("Role is required");
    }
    return UserService.createUser(user);
  }

  @Put("/update/{id}")
  @Security("jwt")
  @Middlewares(upload.any(), appendPhoto)
  public async updateUser(
    @Path() id: string,
    @Body() user: Partial<ISignUpUser>,
  ) {
    return UserService.updateUser(id, user);
  }

  @Get("/me")
  @Security("jwt")
  @Middlewares(loggerMiddleware)
  public getMe(@Request() req: ExpressRequest) {
    return UserService.getMe(req);
  }
}
