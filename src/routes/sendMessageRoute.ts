import { Router } from 'express';
import SendMessage from '../controllers/sendMessageController';


const router: Router = Router();


router.post('/', SendMessage);

export default router;