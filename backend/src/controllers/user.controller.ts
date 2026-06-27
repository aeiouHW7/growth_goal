import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";

const userService = new UserService();

export class UserController {
  async get(_req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.get();
      res.json({ data: user });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { age, occupation, industry, weekdayAvailableHours, weekendAvailableHours } = req.body;
      if (!age || !occupation || !industry || weekdayAvailableHours === undefined || weekendAvailableHours === undefined) {
        res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: "age/occupation/industry/weekdayAvailableHours/weekendAvailableHours 为必填项" },
        });
        return;
      }
      const user = await userService.create(req.body);
      res.status(201).json({ data: user });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(req.body);
      res.json({ data: user });
    } catch (err) {
      next(err);
    }
  }
}
