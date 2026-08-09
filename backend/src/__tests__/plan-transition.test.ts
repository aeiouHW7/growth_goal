import { PlanStatus } from "@prisma/client";
import { validatePlanTransition } from "../services/plan.service";

describe("validatePlanTransition（VS3 状态机放宽）", () => {
  it("PENDING → COMPLETED 允许（新增直通）", () => {
    expect(() => validatePlanTransition(PlanStatus.PENDING, PlanStatus.COMPLETED)).not.toThrow();
  });

  it("PENDING → IN_PROGRESS 仍允许（保留中间态）", () => {
    expect(() => validatePlanTransition(PlanStatus.PENDING, PlanStatus.IN_PROGRESS)).not.toThrow();
  });

  it("PENDING → CANCELLED 仍允许（软删）", () => {
    expect(() => validatePlanTransition(PlanStatus.PENDING, PlanStatus.CANCELLED)).not.toThrow();
  });

  it("COMPLETED → PENDING 拒绝（终态不可逆）", () => {
    expect(() => validatePlanTransition(PlanStatus.COMPLETED, PlanStatus.PENDING)).toThrow();
  });

  it("IN_PROGRESS → COMPLETED 允许", () => {
    expect(() => validatePlanTransition(PlanStatus.IN_PROGRESS, PlanStatus.COMPLETED)).not.toThrow();
  });
});
