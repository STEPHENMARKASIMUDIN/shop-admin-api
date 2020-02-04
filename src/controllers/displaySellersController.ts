import { Request, Response } from 'express';
import { MLSQL, timeout, responseEnd, formatDate } from '../helpers';
import { QueryOptions, RowDataPacket } from 'mysql2';
import Query from '../Query';
import ResMsg from '../helpers/ResMsg';
import ResJson from '../helpers/ResJson';
import loggerAdmin from '../helpers/logger';


async function DisplaySellers(req: Request, res: Response) {

  let result: [] | any, mlsql: MLSQL, retries = 0;

  retry();


  async function retry() {
    try {
      mlsql = new MLSQL();
      await mlsql.establishConnection();
      const o: QueryOptions = {
        sql: Query(0),
        timeout
      };
      result = await mlsql.query(o);
      loggerAdmin('info', `Seller Count: ${result.length}`, '[displaySellersController.js Query Result]');
      let s = JSON.stringify(result).replace(/[\n\\s\\f\\t\\\\r]/gm, '');
      loggerAdmin('info', `Sellers: ${s}`, '[displaySellersController.js Query Result]');
      mlsql.releaseCon();
      if (!result.length) {
        responseEnd(ResJson(400, ResMsg(400)), res);
      }
      else {
        result = result.map(seller => formatDate(seller));
        responseEnd({ ...ResJson(200, ResMsg(200)), Seller_List: result }, res);
      }
    }
    catch (e) {
      loggerAdmin('fatal', e.message, '[displaySellersController.js catch]');
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

export default DisplaySellers;