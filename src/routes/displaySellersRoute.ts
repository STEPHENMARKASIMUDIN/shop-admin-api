import { Router } from 'express';
import DisplaySellersController from '../controllers/displaySellersController';


const router: Router = Router();

router.get('/', DisplaySellersController);


export default router;