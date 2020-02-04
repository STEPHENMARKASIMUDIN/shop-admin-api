import { Router } from "express";
import ChangePassword from "../controllers/changePasswordController";

const router: Router = Router();

router.post('/', ChangePassword);

export default router;