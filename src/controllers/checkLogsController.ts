import ResMsg from '../helpers/ResMsg';
import ResJson from '../helpers/ResJson';
import loggerAdmin from '../helpers/logger';
import { Request, Response } from 'express';
import { logPath, checkValidDate, genFileName, sendLogsContents, responseEnd } from '../helpers';



function checkLogs(req: Request, res: Response) {
  try {
    if (!req.query.date) {
      sendLogsContents(logPath(), res);
    } else {
      if (!checkValidDate(req.query.date)) {
        responseEnd(ResJson(406, 'Invalid Date.'), res);
      } else {
        let newFileName: string = genFileName(req.query.date);
        sendLogsContents(newFileName, res);
      }
    }
  } catch (e) {
    loggerAdmin('fatal', e.message, `[checkLogsController.js catch]`);
    responseEnd(ResJson(500, ResMsg(0)), res);
  }
}


export default checkLogs;
