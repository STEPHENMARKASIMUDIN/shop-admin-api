import ResMsg from '../helpers/ResMsg';
import ResJson from '../helpers/ResJson';
import loggerAdmin from '../helpers/logger';
import { Response, Request } from 'express';
import { SendMailFuncOptions, sendMail, SendMailBody, responseEnd } from '../helpers';

function SendMessage(req: Request, res: Response) {

  try {
    const body: SendMailBody = req.body;
    if (!body.sellerEmail || !body.message) {
      loggerAdmin('error', ResMsg(16), `[sendMessageController.js ${ResMsg(16)}]`);
      responseEnd(ResJson(463, ResMsg(16)), res);
    } else {
      const o: SendMailFuncOptions = {
        ...req.body,
        messageOccured: 'sendMessageController.js',
        response: res
      }
      sendMail(o);
    }
  } catch (e) {
    loggerAdmin('error', e.message, `[sendMessageController.js catch]`);
    responseEnd(ResJson(500, ResMsg(0)), res);
  }
}

export default SendMessage;

