import loggerAdmin from '../helpers/logger';
import ResMsg from '../helpers/ResMsg';
import ResJson from '../helpers/ResJson';
import { Request, Response } from 'express';
import { MLSQL, LoginBody, timeout, responseEnd } from '../helpers';
import { QueryOptions } from 'mysql2';
import Query from '../Query';



async function SearchBySeller(req: Request, res: Response) {
  let retries = 0;

  await retry();

  async function retry() {
    let mlsql: MLSQL, result: any;
    try {
      if (!req.query.sellerName) {
        loggerAdmin('error', ResMsg(16), `[searchBySeller.js ${ResMsg(16)}]`);
        responseEnd(ResJson(463, ResMsg(16)), res);
      }
      else {
        mlsql = new MLSQL();
        await mlsql.establishConnection();
        const o: QueryOptions = {
          sql: Query(6),
          values: req.query.sellerName,
          timeout
        };
        result = await mlsql.query(o);
        mlsql.releaseCon();
        responseEnd({ ...ResJson(200, ResMsg(200)), result }, res);
      }
    }
    catch (e) {
      mlsql ? mlsql.releaseCon() : '';
      loggerAdmin('fatal', e.message, '[searchBySeller.js catch]');
      if (retries >= 3) {
        responseEnd(ResJson(500, ResMsg(0)), res);
      } else {
        retries++;
        await retry();
      }
    }
  }
}

export default SearchBySeller;