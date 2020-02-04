import Query from "../Query";
import ResJson from "../helpers/ResJson";
import ResMsg from "../helpers/ResMsg";
import { Request, Response } from 'express';
import { QueryOptions } from 'mysql2';
import loggerAdmin from "../helpers/logger";
import { MLSQL, DenySellerBody, timeout, responseEnd } from "../helpers";


async function DenySeller(req: Request, res: Response) {

  let retries = 0;
  retry();

  async function retry() {
    let mlsql: MLSQL, o: QueryOptions, result: any, body: DenySellerBody = req.body;
    try {
      if (!body.merchantID || !body.email) {
        loggerAdmin('error', ResMsg(16), `[denySellerController.js ${ResMsg(16)}]`);
        responseEnd(ResJson(463, ResMsg(16)), res);
      }
      else {
        mlsql = new MLSQL();
        o = {
          sql: Query(4),
          values: [body.merchantID, body.email],
          timeout
        };
        await mlsql.establishConnection();
        result = await mlsql.transaction(o);
        mlsql.releaseCon();
        loggerAdmin('info', `Affected Rows: ${result.affectedRows}`, `[denySellerController.js Query Result]`);
        if (result.affectedRows) {
          responseEnd(ResJson(200, ResMsg(200)), res);
        }
        else {
          responseEnd(ResJson(500, ResMsg(0)), res);
        }
      }
    }
    catch (e) {
      loggerAdmin('error', e.message, `[denySellerController.js catch]`);
      if (mlsql) {
        mlsql.releaseCon();
      }
      if (retries >= 3) {
        responseEnd(ResJson(500, ResMsg(0)), res);
      } else {
        retries++;
        retry();
      }

    }
  }
}


export default DenySeller;