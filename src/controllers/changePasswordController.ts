import { Request, Response } from 'express';
import ResJson from '../helpers/ResJson';
import ResMsg from '../helpers/ResMsg';
import { QueryOptions } from 'mysql2';
import { responseEnd, MLSQL, ChangePasswordBody, timeout, SendMailFuncOptions, sendMail } from '../helpers';
import Query from '../Query';
import loggerAdmin from '../helpers/logger';



async function ChangePassword(req: Request, res: Response) {
  let retries = 0;


  retry();


  async function retry() {
    let mlsql: MLSQL, body: ChangePasswordBody = req.body, result: any;
    const numRegex = /[0-9]/g,
      lowRegex = /[a-z]/g,
      upRegex = /[A-Z]/g, specialRegex = /\W/g;

    try {
      const { email, newPassword: p, merchantID } = body;
      if (!email || !p || !merchantID) {
        loggerAdmin('error', ResMsg(16), `[changePasswordController.js ${ResMsg(16)}]`);
        responseEnd(ResJson(463, ResMsg(16)), res);
      }
      // else if (p.length < 6) {
      //   loggerAdmin('error', ResMsg(30), `[changePasswordController.js ${ResMsg(30)}]`);
      //   responseEnd(ResJson(401, ResMsg(30)), res);
      // }
      // else if (p.length > 20) {
      //   loggerAdmin('error', ResMsg(30), `[changePasswordController.js ${ResMsg(30)}]`);
      //   responseEnd(ResJson(401, ResMsg(30)), res);
      // }
      // else if (!numRegex.test(p) || !lowRegex.test(p) || !upRegex.test(p) || !specialRegex.test(p)) {
      //   loggerAdmin('error', ResMsg(31), `[changePasswordController.js ${ResMsg(31)}]`);
      //   responseEnd(ResJson(401, ResMsg(31)), res);
      // }
      else {
        mlsql = new MLSQL();
        await mlsql.establishConnection();
        const o: QueryOptions = {
          sql: Query(8),
          values: [p, merchantID, email],
          timeout
        };
        result = await mlsql.transaction(o);
        mlsql.releaseCon();
        if (result.affectedRows) {
          const emailO: SendMailFuncOptions = {
            isChangePassword: true,
            sellerEmail: email,
            messageOccured: 'changePasswordController.js',
            message: ResMsg(32),
            response: res,
            newPassword: p
          };
          sendMail(emailO);
          responseEnd(ResJson(200, ResMsg(32)), res);
        } else {
          responseEnd(ResJson(500, ResMsg(0)), res);
        }
      }
    } catch (e) {
      mlsql ? mlsql.releaseCon() : '';
      if (retries >= 3) {
        loggerAdmin('error', e.message, '[changePasswordController.js catch]');
        responseEnd(ResJson(500, ResMsg(0)), res);
      } else {
        retries++;
        retry();
      }
    }
  };

}

export default ChangePassword;