import type { $Enums } from "@prisma/client";
import { TsoaResponse } from "tsoa";
export interface IResponse<T> {
  statusCode: number;
  message: string;
  error?: unknown;
  data?: T;
}

export type TUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber: string;
  photo?: Express.Multer.File | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  roles?: { id: string; role: string; userId: string }[];
};

export type RoleT = "ADMIN" | "ORGANIZATION" | "CITIZEN";

export interface IUser extends Omit<TUser, "id" | "createdAt" | "updatedAt"> {}
export interface ILoginResponse
  extends Omit<TUser, "password" | "createdAt" | "updatedAt" | "roles"> {
  token: string;
  roles: $Enums.Role[];
}
export interface ILoginUser extends Pick<IUser, "email" | "password"> {}
export interface ISignUpUser
  extends Pick<
    IUser,
    "email" | "password" | "firstName" | "lastName" | "photo" | "phoneNumber"
  > {
  role: RoleT;
}

export interface CreateUser {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber: string;
  photo?: Express.Multer.File | string | null;
  role: RoleT;
}

export type TErrorResponse = TsoaResponse<
  400 | 401 | 500,
  IResponse<{ message: string }>
>;

export interface IResponse<T> {
  statusCode: number;
  message: string;
  data?: T;
}

export type TOrganization = {
  id: string;
  userId: string;
  name: string;
  category: string;
  address: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateOrganiztionDto {
  userId?: string;
  name: string;
  category: string;
  address: string;
  tags: string[];
}

export type TFeedback = {
  id: string;
  category: string;
  userId: string;
  description: string;
  location: string;
  ticket?: string | null;
  galleryImages?: (Express.Multer.File | string)[];
  phoneNumber?: string | null;
  organizationIds?: string[] | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateFeedbackDto {
  phoneNumber?: string | null;
  ticket?: string | null;
  category: string;
  userId?: string;
  description: string;
  location: string;
  organizationIds?: string[];
  galleryImages?: string[];
}

export type TResponse = {
  id: string;
  subject: string;
  feedbackId: string;
  description: string;
  organizationId?: string | null;
  photo?: Express.Multer.File | string | null;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateResponseDto {
  subject: string;
  feedbackId: string;
  description: string;
  organizationId?: string;
  photo?: Express.Multer.File | string | null;
}
