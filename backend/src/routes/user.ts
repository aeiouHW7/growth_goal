import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();
const controller = new UserController();

router.get("/", controller.get.bind(controller));
router.post("/", controller.create.bind(controller));
router.put("/", controller.update.bind(controller));

export default router;
