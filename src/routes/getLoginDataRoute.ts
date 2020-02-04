import { Router } from 'express';
import getLoginData from '../controllers/getLoginDataController';


const router: Router = Router();

router.post('/', getLoginData);

export default router;