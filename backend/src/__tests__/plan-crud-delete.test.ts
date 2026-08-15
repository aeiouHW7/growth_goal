import { Prisma } from "@prisma/client";
import request from "supertest";
import app from "../app";
import { prisma } from "../prisma";
import { GoalService } from "../services/goal.service";
import { PlanService } from "../services/plan.service";

jest.mock("../prisma", () => ({
  prisma: {
    user: { findFirst: jest.fn() },
    lifeGoal: { delete: jest.fn() },
    yearlyGoal: { findMany: jest.fn(), deleteMany: jest.fn(), delete: jest.fn() },
    monthlyPlan: { findMany: jest.fn(), deleteMany: jest.fn(), delete: jest.fn() },
    dailyPlan: { deleteMany: jest.fn(), delete: jest.fn() },
    $transaction: jest.fn(),
  },
}));

function p2025(message = "Record not found"): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError(message, {
    code: "P2025",
    clientVersion: "test",
  });
}

// $transaction 直接执行回调，把 mock prisma 当作事务句柄传入
function mockTransaction() {
  (prisma.$transaction as jest.Mock).mockImplementation(async (fn: (tx: any) => any) => fn(prisma));
}

describe("GoalService.deleteLifeGoal", () => {
  beforeEach(() => jest.clearAllMocks());

  it("直接删除人生目标", async () => {
    (prisma.lifeGoal.delete as jest.Mock).mockResolvedValue({ id: "l1" });
    const result = await new GoalService().deleteLifeGoal("l1");
    expect(prisma.lifeGoal.delete).toHaveBeenCalledWith({ where: { id: "l1" } });
    expect(result).toEqual({ deleted: 1 });
  });
});

describe("GoalService.deleteYearlyGoal（级联）", () => {
  beforeEach(() => jest.clearAllMocks());

  it("事务内先删其子目标/月度/日计划再删自身", async () => {
    (prisma.yearlyGoal.findMany as jest.Mock).mockResolvedValue([]); // 无子目标
    (prisma.monthlyPlan.findMany as jest.Mock).mockResolvedValue([{ id: "m1" }, { id: "m2" }]);
    (prisma.dailyPlan.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });
    (prisma.monthlyPlan.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
    (prisma.yearlyGoal.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
    mockTransaction();

    const result = await new GoalService().deleteYearlyGoal("y1");

    expect(prisma.yearlyGoal.findMany).toHaveBeenCalledWith({
      where: { parentId: "y1" }, select: { id: true },
    });
    expect(prisma.dailyPlan.deleteMany).toHaveBeenCalledWith({
      where: { monthlyPlanId: { in: ["m1", "m2"] } },
    });
    expect(prisma.monthlyPlan.deleteMany).toHaveBeenCalledWith({
      where: { yearlyGoalId: { in: ["y1"] } },
    });
    expect(prisma.yearlyGoal.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["y1"] } },
    });
    expect(result).toEqual({ deleted: 3 + 2 + 1 });
  });

  it("级联删除两层子目标（y1 → c1 → c2）", async () => {
    (prisma.yearlyGoal.findMany as jest.Mock)
      .mockResolvedValueOnce([{ id: "c1" }])
      .mockResolvedValueOnce([{ id: "c2" }])
      .mockResolvedValueOnce([]);
    (prisma.monthlyPlan.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.dailyPlan.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.monthlyPlan.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.yearlyGoal.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });
    mockTransaction();

    const result = await new GoalService().deleteYearlyGoal("y1");

    expect(prisma.yearlyGoal.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["y1", "c1", "c2"] } },
    });
    expect(result).toEqual({ deleted: 3 });
  });

  it("不存在时抛 NOT_FOUND → 由错误处理器映射 404", async () => {
    (prisma.yearlyGoal.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.monthlyPlan.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.dailyPlan.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.monthlyPlan.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.yearlyGoal.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    mockTransaction();

    await expect(new GoalService().deleteYearlyGoal("y1")).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });
  });

  it("事务回滚：子级删除失败时整体拒绝，父级不删除", async () => {
    (prisma.yearlyGoal.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.monthlyPlan.findMany as jest.Mock).mockResolvedValue([{ id: "m1" }]);
    (prisma.dailyPlan.deleteMany as jest.Mock).mockRejectedValue(new Error("db down"));
    mockTransaction();

    await expect(new GoalService().deleteYearlyGoal("y1")).rejects.toThrow("db down");
    expect(prisma.monthlyPlan.deleteMany).not.toHaveBeenCalled();
    expect(prisma.yearlyGoal.deleteMany).not.toHaveBeenCalled();
  });
});

describe("PlanService.deleteMonthlyPlan / deleteDailyPlan", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deleteMonthlyPlan 事务内先删其 DailyPlan 再删自身", async () => {
    (prisma.dailyPlan.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
    (prisma.monthlyPlan.delete as jest.Mock).mockResolvedValue({ id: "m1" });
    mockTransaction();

    const result = await new PlanService().deleteMonthlyPlan("m1");

    expect(prisma.dailyPlan.deleteMany).toHaveBeenCalledWith({ where: { monthlyPlanId: "m1" } });
    expect(prisma.monthlyPlan.delete).toHaveBeenCalledWith({ where: { id: "m1" } });
    expect(result).toEqual({ deleted: 3 });
  });

  it("deleteMonthlyPlan 不存在（P2025）时传播异常", async () => {
    (prisma.dailyPlan.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.monthlyPlan.delete as jest.Mock).mockRejectedValue(p2025());
    mockTransaction();

    await expect(new PlanService().deleteMonthlyPlan("m1")).rejects.toMatchObject({ code: "P2025" });
  });

  it("deleteDailyPlan 直接删除", async () => {
    (prisma.dailyPlan.delete as jest.Mock).mockResolvedValue({ id: "d1" });
    const result = await new PlanService().deleteDailyPlan("d1");
    expect(prisma.dailyPlan.delete).toHaveBeenCalledWith({ where: { id: "d1" } });
    expect(result).toEqual({ deleted: 1 });
  });
});

describe("DELETE 端点（supertest，mock prisma）", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: "u1" });
  });

  it("DELETE /api/goals/life/:id → 200", async () => {
    (prisma.lifeGoal.delete as jest.Mock).mockResolvedValue({ id: "l1" });
    const res = await request(app).delete("/api/goals/life/l1");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ deleted: 1 });
  });

  it("DELETE /api/goals/life/:id → 404（不存在）", async () => {
    (prisma.lifeGoal.delete as jest.Mock).mockRejectedValue(p2025());
    const res = await request(app).delete("/api/goals/life/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("DELETE /api/goals/yearly/:id → 404（不存在，级联事务回滚）", async () => {
    (prisma.yearlyGoal.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.monthlyPlan.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.dailyPlan.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.monthlyPlan.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.yearlyGoal.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    mockTransaction();

    const res = await request(app).delete("/api/goals/yearly/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("DELETE /api/plans/monthly/:id → 404（不存在）", async () => {
    (prisma.dailyPlan.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.monthlyPlan.delete as jest.Mock).mockRejectedValue(p2025());
    mockTransaction();

    const res = await request(app).delete("/api/plans/monthly/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("DELETE /api/plans/daily/:id → 404（不存在）", async () => {
    (prisma.dailyPlan.delete as jest.Mock).mockRejectedValue(p2025());
    const res = await request(app).delete("/api/plans/daily/nope");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
