import { Router } from 'express';

import downloadPermit from '../controllers/downloadPermitController';

const router: Router = Router();

router.get('/', downloadPermit);

export default router;


