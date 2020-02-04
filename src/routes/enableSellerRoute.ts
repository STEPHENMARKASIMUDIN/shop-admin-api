import EnableSeller from "../controllers/enableSellerController";
import { Router } from "express";


const router: Router = Router();

router.post('/', EnableSeller);

export default router;
