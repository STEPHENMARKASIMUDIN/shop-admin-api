import Query from '../Query';
import ResMsg from '../helpers/ResMsg';
import { QueryOptions } from 'mysql2';
import { MLSQL, timeout, EditSellerBody, responseEnd } from '../helpers';
import { Response, Request } from 'express';
import loggerAdmin from '../helpers/logger';
import ResJson from '../helpers/ResJson';


async function EditSeller(req: Request, res: Response) {
  let retries = 0;


  retry();

  async function retry() {
    let result: any;
    const body: EditSellerBody = req.body;
    let mlsql: MLSQL;
    try {
      if (!body.city || !body.contactNumber || !body.country
        || !body.email || !body.merchantID || !body.merchantName
        || !body.shopName || !body.storeAddress || !body.storeDescription) {
        loggerAdmin('error', ResMsg(16), `[editSellerController.js ${ResMsg(16)}]`)
        responseEnd(ResJson(463, ResMsg(16)), res);
      } else {

        mlsql = new MLSQL();
        const o: QueryOptions = {
          sql: Query(2), 
          values: [body.merchantName, body.shopName, body.email, body.storeAddress,
          body.city, body.country, body.contactNumber, body.storeDescription, body.merchantID],
          timeout
        }
        await mlsql.establishConnection();
        result = await mlsql.transaction(o);
        if (result.affectedRows) {
          loggerAdmin('info', `${ResMsg(200)} in Editing Seller.`, `[editSellerController.js ${ResMsg(200)}]`)
          responseEnd({ ...ResJson(200, ResMsg(200)), body }, res);
        } else {
          loggerAdmin('error', `Failed in Editing Seller.`, `[editSellerController.js Failed]`)
          responseEnd(ResJson(500, ResMsg(0)), res);
        }
      }

    } catch (e) {
      if (mlsql) { mlsql.releaseCon(); }
      loggerAdmin('fatal', e.message, '[editSellerController.js catch]');
      if (retries >= 3) {
        responseEnd(ResJson(500, ResMsg(0)), res);
      } else {
        retries++;
        retry();
      }
    }
  }



}


export default EditSeller;