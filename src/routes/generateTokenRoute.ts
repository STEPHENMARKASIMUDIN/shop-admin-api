import generateToken from "../controllers/generateTokenController";
import { Router } from 'express';

const router: Router = Router();
router.post('/', generateToken);

export default router;
