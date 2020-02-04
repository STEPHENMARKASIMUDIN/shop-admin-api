import { Router } from 'express';
import SearchBySeller from '../controllers/searchBySellerController';


const router: Router = Router();

router.get('/', SearchBySeller);

export default router;