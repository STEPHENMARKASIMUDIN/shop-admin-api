import { Router } from 'express';
import EditSeller from '../controllers/editSellerController';

const router: Router = Router();


router.post('/', EditSeller);


export default router;