import checkLogs from "../controllers/checkLogsController";
import { Router } from 'express';

const router: Router = Router();

router.get('/', checkLogs);

export default router;
