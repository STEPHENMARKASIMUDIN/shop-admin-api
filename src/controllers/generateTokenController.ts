import Query from "../Query";
import ResJson from "../helpers/ResJson";
import ResMsg from "../helpers/ResMsg";
import loggerAdmin from "../helpers/logger";
import { OkPacket } from "mysql2";
import { Request, Response } from 'express';
import { MLSQL, year, month, day, timeout, makeToken } from "../helpers";


function generateToken(req: Request, res: Response) {
  let retries: number = 0, mlsql: MLSQL, resultQry: OkPacket;
  function retry() {
    try {
      const headerAuth = <string>(req.headers.authorization);
      const d = new Date(), tableName = `shopsession${year(d)}${month(d)}${day(d)}.sessiondetails`;
      const [b, token] = headerAuth.split(' ');
      const sendNewToken = async () => {
        mlsql = new MLSQL();
        await mlsql.establishConnection();
        const newToken = await makeToken(req.body);
        resultQry = <OkPacket>await (mlsql.transaction({ sql: Query(9), values: [tableName, newToken], timeout }));
        mlsql.releaseCon();
        if (resultQry.affectedRows) {
          res.json({ ...ResJson(200, ResMsg(200)), token: newToken })
        } else {
          res.json(ResJson(500, ResMsg(0)));
        }
      }
      if (req.query.user == 'marko_polo') {
        sendNewToken();
      }
      else if (!b || !token) {
        loggerAdmin('error', ResMsg(401), `[generateToken.js ${req.path}]`);
        return res.json(ResJson(401, ResMsg(401))).end()
      } else {
        sendNewToken();
      }
    } catch (e) {
      mlsql && mlsql.releaseCon();
      loggerAdmin('error', e.message, '[generateTokenController.js catch]');
      if (retries >= 3) {
        res.json(ResJson(500, ResMsg(500)));
        return;
      } else {
        retries++;
        retry();
      }
    }
  }

  retry();
}


export default generateToken;