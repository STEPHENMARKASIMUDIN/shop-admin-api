import { QueryOptions } from 'mysql2';
import { Response, Request } from 'express';
import { SellerDetailsBody, MLSQL, timeout, responseEnd } from '../helpers';
import ResJson from '../helpers/ResJson';
import ResMsg from '../helpers/ResMsg';
import loggerAdmin from '../helpers/logger';
import Query from '../Query';

async function SellerDetails(req: Request, res: Response) {

  let retries = 0;

  await retry();

  async function retry() {
    let mlsql: MLSQL, result: any, o: QueryOptions, body: SellerDetailsBody = req.body;
    try {
      if (!body.merchantID) {
        loggerAdmin('error', ResMsg(16), `[sellerDetailsController.js ${ResMsg(16)}]`);
        responseEnd(ResJson(463, ResMsg(16)), res);
      }
      else {
        mlsql = new MLSQL();
        await mlsql.establishConnection();
        o = {
          sql: Query(3),
          values: [body.merchantID],
          timeout
        };
        result = await mlsql.query(o);
        loggerAdmin('info', result, `[sellerDetailsController.js Query Result]`);
        mlsql.releaseCon();
        responseEnd({ ...ResJson(200, ResMsg(200)), result: result[0] }, res);
      }
    }
    catch (e) {
      loggerAdmin('error', e.message, `[sellerDetailsController.js catch]`);
      if (mlsql) {
        mlsql.releaseCon();
      }
      if (retries >= 3) {
        responseEnd(ResJson(500, ResMsg(0)), res);
      } else {
        retries++;
        await retry();
      }
    }
  }
}

export default SellerDetails;