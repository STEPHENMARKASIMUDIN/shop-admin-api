import { Router } from 'express';
import DenySeller from "../controllers/denySellerController";

const router: Router = Router();

router.post('/', DenySeller);

export default router;