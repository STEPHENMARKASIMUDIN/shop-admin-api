import ResJson from "../helpers/ResJson";
import loggerAdmin from "../helpers/logger";
import { MLSQL } from "../helpers";
import { Request, Response } from 'express';


async function checkConnection(req: Request, res: Response) {


  let retries: number = 0
  const retry = async () => {
    let mlsql: MLSQL;
    try {
      mlsql = new MLSQL();
      await mlsql.establishConnection();
      mlsql.releaseCon();
      loggerAdmin('info', 'Success in connecting to Database.', '[checkConnectionController.js try]');
      res.json(ResJson(200, "Success in connecting to Database."));
      return;
    } catch (e) {
      if (mlsql) { mlsql.releaseCon(); }
      loggerAdmin('info', 'Failed in connecting to Database. ' + e.message, '[checkConnectionController.js catch]');
      if (retries >= 3) {
        res.json(ResJson(500, "Failed in connecting to Database."));
        return;
      } else {
        retries++;
        retry();
      }
    }
  }
  retry();

}



export default checkConnection;