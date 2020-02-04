import Query from "../Query";
import ResMsg from "../helpers/ResMsg";
import ResJson from "../helpers/ResJson";
import loggerAdmin from "../helpers/logger";
import { Request, Response } from 'express';
import { QueryOptions, OkPacket } from "mysql";
import { MLSQL, timeout, responseEnd, year, month, day } from "../helpers";


async function logout(req: Request, res: Response) {
  let retries: number = 0
  const retry = async () => {
    retries++;
    let mlsql: MLSQL, tableName: string = '';
    try {
      if (!req.headers.authorization) {
        return responseEnd(ResJson(401, ResMsg(33)), res);
      } else {
        const d = new Date();
        tableName = `shopsession${year(d)}${month(d)}${day(d)}.sessiondetails`;
        const [tokenType, token] = req.headers.authorization.split(' ');
        if (tokenType !== 'Bearer' || !token) {
          return responseEnd(ResJson(401, ResMsg(33)), res);
        } else {
          mlsql = new MLSQL();
          const o: QueryOptions = {
            sql: Query(10),
            values: [tableName, token],
            timeout
          }
          await mlsql.establishConnection();
          let result = <OkPacket>await mlsql.transaction(o);
          mlsql.releaseCon();
          if (result.affectedRows) {
            loggerAdmin('info', `${ResMsg(200)}`, `[logoutController.js ${ResMsg(200)}]`)
            responseEnd(ResJson(200, ResMsg(200)), res);
          } else {
            loggerAdmin('error', `Token Not Found: ${token}`, `[logoutController.js ${ResMsg(34)}]`)
            responseEnd(ResJson(401, ResMsg(34)), res);
          }
        }
      }
    } catch (e) {
      mlsql && mlsql.releaseCon();
      loggerAdmin('error', e.message, '[logoutController.js catch]');
      if (retries >= 3) {
        return responseEnd(ResJson(500, ResMsg(500)), res);
      } else {
        retries++;
        retry();
      }
    }
  };

  retry();
}


export default logout;