import { prisma } from "../utils/client";
import { hash } from "bcrypt";
import AppError from "../utils/error";
import type {
  CreateOrganiztionDto,
  CreateUser,
  IResponse,
  TOrganization,
} from "../utils/interfaces/common";

export class OrganizationService {
  public static async createOrganizationWithUser(
    organization: CreateOrganiztionDto & { user: CreateUser },
  ): Promise<IResponse<TOrganization>> {
    try {
      const { user, ...orgData } = organization;

      // Check if user already exists
      const userExists = await prisma.user.findFirst({
        where: { email: user.email },
      });
      if (userExists) {
        throw new AppError("User already exists", 409);
      }

      // Hash password
      const hashedPassword = await hash(user.password, 10);

      // Create user and organization in a transaction
      const createdOrganization = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: hashedPassword,
            phoneNumber: user.phoneNumber,
            photo: typeof user.photo === "string" ? user.photo : undefined,
          },
        });

        await tx.userRoles.create({
          data: {
            userId: newUser.id,
            role: user.role,
          },
        });

        return tx.organization.create({
          data: {
            ...orgData,
            userId: newUser.id,
          },
        });
      });

      return {
        message: "Organization and user created successfully",
        statusCode: 201,
        data: createdOrganization,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async updateOrganization(
    organization: Partial<CreateOrganiztionDto>,
  ): Promise<IResponse<TOrganization>> {
    try {
      const { userId, name, category, address, tags } = organization;

      // Check if organization exists
      const existingOrganization = await prisma.organization.findFirst({
        where: { userId },
      });
      if (!existingOrganization) {
        throw new AppError("Organization not found", 404);
      }

      // Update organization
      const updatedOrganization = await prisma.organization.update({
        where: { id: existingOrganization.id },
        data: {
          name,
          category,
          address,
          tags,
        },
      });

      return {
        message: "Organization updated successfully",
        statusCode: 200,
        data: updatedOrganization,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getAllOrganizations(): Promise<
    IResponse<TOrganization[]>
  > {
    try {
      const organizations = await prisma.organization.findMany({
        include: {
          organizationUser: {
            include: {
              roles: true,
            },
          },
        },
      });
      return {
        message: "Organizations retrieved successfully",
        statusCode: 200,
        data: organizations,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getOrganizationById(
    id: string,
  ): Promise<IResponse<TOrganization>> {
    try {
      const organization = await prisma.organization.findUnique({
        where: { id },
        include: {
          organizationUser: {
            include: {
              roles: true,
            },
          },
        },
      });
      if (!organization) {
        throw new AppError("Organization not found", 404);
      }
      return {
        message: "Organization retrieved successfully",
        statusCode: 200,
        data: organization,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async deleteOrganization(id: string): Promise<IResponse<null>> {
    try {
      // Check if organization exists
      const organization = await prisma.organization.findUnique({
        where: { id },
      });
      if (!organization) {
        throw new AppError("Organization not found", 404);
      }

      // Delete organization
      await prisma.organization.delete({
        where: { id },
      });

      return {
        message: "Organization deleted successfully",
        statusCode: 200,
        data: null,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }
}
