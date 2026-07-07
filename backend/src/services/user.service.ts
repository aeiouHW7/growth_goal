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

/** Serialize string[] fields to JSON strings for SQLite compatibility */
function toDb(input: CreateUserInput | UpdateUserInput): Record<string, any> {
  const data = { ...input } as Record<string, any>;
  if (data.goalDomains !== undefined) {
    data.goalDomains = JSON.stringify(data.goalDomains);
  }
  return data;
}

/** Deserialize JSON string fields from SQLite back to objects */
function fromDb(user: Record<string, any> | null): any {
  if (!user) return user;
  if (typeof user.goalDomains === "string") {
    try { user.goalDomains = JSON.parse(user.goalDomains); } catch {}
  }
  return user;
}

export class UserService {
  async get() {
    const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
    return fromDb(user as any);
  }

  async create(data: CreateUserInput) {
    const existing = await prisma.user.findFirst();
    if (existing) {
      throw Object.assign(new Error("用户已存在，请使用 PUT 更新"), {
        status: 409,
        code: "USER_ALREADY_EXISTS",
      });
    }
    const user = await prisma.user.create({ data: toDb(data) as any });
    return fromDb(user as any);
  }

  async update(data: UpdateUserInput) {
    const user = await prisma.user.findFirst();
    if (!user) {
      throw Object.assign(new Error("用户不存在，请先创建"), {
        status: 404,
        code: "USER_NOT_FOUND",
      });
    }
    const updated = await prisma.user.update({ where: { id: user.id }, data: toDb(data) as any });
    return fromDb(updated as any);
  }
}
