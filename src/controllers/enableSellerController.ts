import loggerAdmin from '../helpers/logger';
import ResMsg from '../helpers/ResMsg';
import ResJson from '../helpers/ResJson';
import { Request, Response } from 'express';
import { MLSQL, EnableSellerBody, timeout, responseEnd } from '../helpers';
import { QueryOptions } from 'mysql2';
import Query from '../Query';



async function EnableSeller(req: Request, res: Response) {
  let retries = 0;
  retry();

  async function retry() {
    let mlsql: MLSQL, body: EnableSellerBody = req.body, result: any;
    try {
      if (!body.email || !body.merchantID) {
        loggerAdmin('error', ResMsg(16), `[enableSellerController.js ${ResMsg(16)}]`);
        responseEnd(ResJson(463, ResMsg(16)), res);
      }
      else {
        const o: QueryOptions = {
          sql: Query(7),
          values: [body.merchantID, body.email],
          timeout
        };
        mlsql = new MLSQL();
        await mlsql.establishConnection();
        result = await mlsql.transaction(o);
        mlsql.releaseCon();
        loggerAdmin('info', `Result: ${result}`, '[enableSellerController.js Transaction Result]');
        if (result.affectedRows) {
          responseEnd(ResJson(200, ResMsg(29)), res);
        }
        else {
          responseEnd(ResJson(500, ResMsg(0)), res);
        }

      }
    }
    catch (e) {
      mlsql ? mlsql.releaseCon() : '';
      loggerAdmin('error', e.message, '[enableSellerController.js catch]');
      if (retries >= 3) {
        responseEnd(ResJson(500, ResMsg(0)), res);
      } else {
        retries++;
        retry();
      }
    }
  }
}

export default EnableSeller;