import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

type JsonValue = Prisma.InputJsonValue;

export interface CreateUserInput {
  age: number;
  occupation: string;
  industry: string;
  weekdayAvailableHours: number;
  weekendAvailableHours: number;
  nickname?: string;
  city?: string;
  weekdayTimeBlocks?: JsonValue;
  weekendTimeBlocks?: JsonValue;
  goalDomains?: string[];
  pastExperience?: string;
}

export interface UpdateUserInput {
  age?: number;
  occupation?: string;
  industry?: string;
  weekdayAvailableHours?: number;
  weekendAvailableHours?: number;
  nickname?: string;
  city?: string;
  weekdayTimeBlocks?: JsonValue;
  weekendTimeBlocks?: JsonValue;
  goalDomains?: string[];
  pastExperience?: string;
}

export class UserService {
  async get() {
    return prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  }

  async create(data: CreateUserInput) {
    const existing = await prisma.user.findFirst();
    if (existing) {
      throw Object.assign(new Error("用户已存在，请使用 PUT 更新"), {
        status: 409,
        code: "USER_ALREADY_EXISTS",
      });
    }
    return prisma.user.create({ data });
  }

  async update(data: UpdateUserInput) {
    const user = await prisma.user.findFirst();
    if (!user) {
      throw Object.assign(new Error("用户不存在，请先创建"), {
        status: 404,
        code: "USER_NOT_FOUND",
      });
    }
    return prisma.user.update({ where: { id: user.id }, data });
  }
}
