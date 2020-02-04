import { Router } from 'express';
import checkConnection from "../controllers/checkConnectionController";


const router: Router = Router();

router.get('/', checkConnection);

export default router;
