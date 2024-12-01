import {
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  userLoginSchema,
  userProfileSchema,
  userRegistrationSchema,
} from "@/validation/schemas";
import { UserRole } from "@prisma/client";
import * as z from "zod";
import { getProjects, getTasks } from "./lib/actions/projects";

// --------------------------- FORMS TYPES--------------------------------------------------------------------------------------
export type UserRegistrationSchemaType = z.infer<typeof userRegistrationSchema>;
export type UserLoginSchemaType = z.infer<typeof userLoginSchema>;
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
export type UserProfileSchemaType = z.infer<typeof userProfileSchema>;
export type PasswordChangeSchemaType = z.infer<typeof changePasswordSchema>;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
};

export interface Project {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  members: SessionUser[];
  createdAt: Date;
}

export interface TProject {
  title: string;
  description?: string;
  ownerId: string;
  members: SessionUser[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  status: TaskStatus;
  assignedToId?: string;
  assignedTo?: SessionUser;
  createdAt: Date;
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  DONE = "DONE",
}

// --------------------------- API RESPONSES TYPES--------------------------------------------------------------------------------------
export type TypeTask = Awaited<ReturnType<typeof getTasks>>[number];
export type TypeProject = Awaited<ReturnType<typeof getProjects>>[number];
