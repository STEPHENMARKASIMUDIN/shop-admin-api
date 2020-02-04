import { Router } from 'express';
import DisableSellerController from '../controllers/disableSellerController';


const router: Router = Router();


router.post('/', DisableSellerController);


export default router;