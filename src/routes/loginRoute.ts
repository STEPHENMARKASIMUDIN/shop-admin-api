import Login from "../controllers/loginController";
import { Router } from 'express';

const router: Router = Router();
router.post('/', Login);

export default router;
