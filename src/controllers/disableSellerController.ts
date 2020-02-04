import Query from '../Query';
import loggerAdmin from '../helpers/logger';
import { QueryOptions } from 'mysql2';
import { MLSQL, DisableSellerBody, timeout, responseEnd } from '../helpers';
import { Request, Response } from 'express';
import ResJson from '../helpers/ResJson';
import ResMsg from '../helpers/ResMsg';

async function DisableSeller(req: Request, res: Response) {
  let retries = 0;



  retry();


  async function retry() {
    let mlsql: MLSQL, o: QueryOptions,
      body: DisableSellerBody = req.body, result: any;
    try {

      if (!body.email || !body.merchantID) {
        loggerAdmin('error', ResMsg(16), `[disableSellerController.js ${ResMsg(16)}]`);
        responseEnd(ResJson(463, ResMsg(16)), res);
      } else {
        mlsql = new MLSQL();
        await mlsql.establishConnection();
        o = {
          sql: Query(1),
          values: [body.merchantID, body.email],
          timeout
        };
        result = await mlsql.transaction(o);
        loggerAdmin('info', `Affected Rows: ${result.affectedRows}`, '[disableSellerController.js Query Result]');
        mlsql.releaseCon();
        if (result.affectedRows) {
          responseEnd(ResJson(200, ResMsg(12)), res);
        } else {
          responseEnd(ResJson(500, ResMsg(0)), res);
        }
      }
    } catch (e) {
      loggerAdmin('fatal', e.message, '[disableSellerController.js catch]');
      if (mlsql) { mlsql.releaseCon(); }
      if (retries >= 3) {
        responseEnd(ResJson(500, ResMsg(0)), res);
      } else {
        retries++;
        retry();
      }
    }
  }
}

export default DisableSeller;

