import { Router } from 'express';
import logout from '../controllers/logoutController';


const router: Router = Router();

router.get('/', logout);

export default router;
