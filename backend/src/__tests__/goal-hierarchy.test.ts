import request from "supertest";
import app from "../app";
import { prisma } from "../prisma";
import { GoalService } from "../services/goal.service";

jest.mock("../prisma", () => ({
  prisma: {
    user: { findFirst: jest.fn() },
    yearlyGoal: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    $transaction: jest.fn(),
  },
}));

// $transaction 直接执行回调，把 mock prisma 当作事务句柄传入
function mockTransaction() {
  (prisma.$transaction as jest.Mock).mockImplementation(async (fn: (tx: any) => any) => fn(prisma));
}

const service = new GoalService();

describe("GoalService 目标父子关系", () => {
  beforeEach(() => jest.clearAllMocks());

  it("createYearlyGoal 带 parentId 时校验父目标存在且同用户", async () => {
    (prisma.yearlyGoal.findUnique as jest.Mock).mockResolvedValue({ id: "p1", userId: "u1" });
    (prisma.yearlyGoal.create as jest.Mock).mockResolvedValue({ id: "c1", parentId: "p1" });

    const goal = await service.createYearlyGoal({
      userId: "u1", parentId: "p1", title: "粉丝500", year: 2026,
      metricType: "NUMERIC" as const, targetValue: "500",
    });

    expect(prisma.yearlyGoal.findUnique).toHaveBeenCalledWith({ where: { id: "p1" }, select: { userId: true } });
    expect(prisma.yearlyGoal.create).toHaveBeenCalledWith({
      data: { userId: "u1", parentId: "p1", title: "粉丝500", year: 2026, metricType: "NUMERIC", targetValue: "500" },
    });
    expect(goal).toEqual({ id: "c1", parentId: "p1" });
  });

  it("createYearlyGoal 父目标不存在 → PARENT_NOT_FOUND", async () => {
    (prisma.yearlyGoal.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.createYearlyGoal({
      userId: "u1", parentId: "nope", title: "x", year: 2026,
      metricType: "NUMERIC" as const, targetValue: "1",
    })).rejects.toMatchObject({ status: 404, code: "PARENT_NOT_FOUND" });
  });

  it("createYearlyGoal 父目标不属于当前用户 → PARENT_FORBIDDEN", async () => {
    (prisma.yearlyGoal.findUnique as jest.Mock).mockResolvedValue({ id: "p1", userId: "other" });

    await expect(service.createYearlyGoal({
      userId: "u1", parentId: "p1", title: "x", year: 2026,
      metricType: "NUMERIC" as const, targetValue: "1",
    })).rejects.toMatchObject({ status: 403, code: "PARENT_FORBIDDEN" });
  });

  it("updateYearlyGoal parentId=null 断开父级", async () => {
    (prisma.yearlyGoal.update as jest.Mock).mockResolvedValue({ id: "c1", parentId: null });

    const result = await service.updateYearlyGoal("c1", { parentId: null });

    expect(prisma.yearlyGoal.update).toHaveBeenCalledWith({
      where: { id: "c1" },
      data: { parent: { disconnect: true } },
    });
    expect(result.parentId).toBeNull();
  });

  it("updateYearlyGoal 设父级时检测自环 → PARENT_CYCLE", async () => {
    (prisma.yearlyGoal.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: "c1", userId: "u1" }) // goal
      .mockResolvedValueOnce({ id: "p1", userId: "u1" }); // parent
    // collectDescendantGoalIds(c1)：c1 的后代包含 p1 → 成环
    (prisma.yearlyGoal.findMany as jest.Mock)
      .mockResolvedValueOnce([{ id: "p1" }])
      .mockResolvedValue([]);

    await expect(service.updateYearlyGoal("c1", { parentId: "p1" }))
      .rejects.toMatchObject({ status: 409, code: "PARENT_CYCLE" });
  });

  it("updateYearlyGoal 不能设自己为父 → PARENT_CYCLE", async () => {
    await expect(service.updateYearlyGoal("c1", { parentId: "c1" }))
      .rejects.toMatchObject({ status: 409, code: "PARENT_CYCLE" });
  });

  it("listYearlyGoals parentId 过滤：null → 顶层目标", async () => {
    (prisma.yearlyGoal.findMany as jest.Mock).mockResolvedValue([{ id: "p1", parentId: null }]);

    await service.listYearlyGoals("u1", { parentId: null });

    expect(prisma.yearlyGoal.findMany).toHaveBeenCalledWith({
      where: { userId: "u1", parentId: null },
      orderBy: [{ year: "asc" }, { createdAt: "asc" }],
    });
  });

  it("listYearlyGoals parentId=<id> 过滤子目标", async () => {
    (prisma.yearlyGoal.findMany as jest.Mock).mockResolvedValue([{ id: "c1", parentId: "p1" }]);

    await service.listYearlyGoals("u1", { parentId: "p1" });

    expect(prisma.yearlyGoal.findMany).toHaveBeenCalledWith({
      where: { userId: "u1", parentId: "p1" },
      orderBy: [{ year: "asc" }, { createdAt: "asc" }],
    });
  });

  it("listYearlyGoals 缺省返回全部（含子目标，供前端组树）", async () => {
    (prisma.yearlyGoal.findMany as jest.Mock).mockResolvedValue([{ id: "p1" }, { id: "c1", parentId: "p1" }]);

    await service.listYearlyGoals("u1");

    expect(prisma.yearlyGoal.findMany).toHaveBeenCalledWith({
      where: { userId: "u1" },
      orderBy: [{ year: "asc" }, { createdAt: "asc" }],
    });
  });
});

describe("目标层级端点（supertest，mock prisma）", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTransaction();
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: "u1" });
  });

  it("GET /api/goals/yearly/:id/children → 200 子目标列表", async () => {
    (prisma.yearlyGoal.findMany as jest.Mock).mockResolvedValue([{ id: "c1", parentId: "p1" }]);

    const res = await request(app).get("/api/goals/yearly/p1/children");

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ id: "c1", parentId: "p1" }]);
    expect(prisma.yearlyGoal.findMany).toHaveBeenCalledWith({
      where: { userId: "u1", parentId: "p1" },
      orderBy: [{ year: "asc" }, { createdAt: "asc" }],
    });
  });

  it("GET /api/goals/yearly?parentId= → 顶层目标", async () => {
    (prisma.yearlyGoal.findMany as jest.Mock).mockResolvedValue([{ id: "p1", parentId: null }]);

    const res = await request(app).get("/api/goals/yearly?parentId=");

    expect(res.status).toBe(200);
    expect(prisma.yearlyGoal.findMany).toHaveBeenCalledWith({
      where: { userId: "u1", parentId: null },
      orderBy: [{ year: "asc" }, { createdAt: "asc" }],
    });
  });

  it("POST /api/goals/yearly 带 parentId 创建子目标", async () => {
    (prisma.yearlyGoal.findUnique as jest.Mock).mockResolvedValue({ id: "p1", userId: "u1" });
    (prisma.yearlyGoal.create as jest.Mock).mockResolvedValue({ id: "c1", parentId: "p1", title: "粉丝500" });

    const res = await request(app)
      .post("/api/goals/yearly")
      .send({ parentId: "p1", title: "粉丝500", year: 2026, metricType: "NUMERIC", targetValue: "500" });

    expect(res.status).toBe(201);
    expect(res.body.data.parentId).toBe("p1");
  });

  it("PUT /api/goals/yearly/:id parentId=null 断开父级", async () => {
    (prisma.yearlyGoal.update as jest.Mock).mockResolvedValue({ id: "c1", parentId: null });

    const res = await request(app).put("/api/goals/yearly/c1").send({ parentId: null });

    expect(res.status).toBe(200);
    expect(res.body.data.parentId).toBeNull();
  });
});
