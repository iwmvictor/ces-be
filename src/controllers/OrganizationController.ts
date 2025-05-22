import {
  Body,
  Post,
  Put,
  Route,
  Security,
  Tags,
  Middlewares,
  Get,
  Path,
  Delete,
} from "tsoa";
import { OrganizationService } from "../services/OrganizationService";
import type {
  CreateOrganiztionDto,
  CreateUser,
} from "../utils/interfaces/common";
import { appendPhoto } from "../middlewares/company.middlewares";
import upload from "../utils/cloudinary";

@Tags("Organization")
@Route("/api/organization")
export class OrganizationController {
  @Post("/create")
  @Security("jwt")
  @Middlewares(upload.any(), appendPhoto)
  public async createOrganization(
    @Body() organization: CreateOrganiztionDto & { user: CreateUser },
  ) {
    return OrganizationService.createOrganizationWithUser(organization);
  }

  @Put("/update/{id}")
  @Security("jwt")
  @Middlewares(upload.any(), appendPhoto)
  public async updateOrganization(
    @Body() organization: Partial<CreateOrganiztionDto>,
  ) {
    return OrganizationService.updateOrganization(organization);
  }

  @Get("/")
  @Security("jwt")
  public async getAllOrganizations() {
    return OrganizationService.getAllOrganizations();
  }

  @Get("/{id}")
  @Security("jwt")
  public async getOrganizationById(@Path() id: string) {
    return OrganizationService.getOrganizationById(id);
  }

  @Delete("/{id}")
  @Security("jwt")
  public async deleteOrganization(@Path() id: string) {
    return OrganizationService.deleteOrganization(id);
  }
}
