import { Router } from 'express';
import SellerDetailsController from '../controllers/sellerDetailsController';



const router: Router = Router();

router.post('/', SellerDetailsController);

export default router;