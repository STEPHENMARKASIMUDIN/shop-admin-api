import ResMsg from '../helpers/ResMsg';
import ResJson from '../helpers/ResJson';
import loggerAdmin from '../helpers/logger';
import { Request, Response } from 'express';
import { LoginBody, responseEnd, getLoginData } from '../helpers';


async function Login(req: Request, res: Response) {
  let body: LoginBody = req.body;
  if (!body.username || !body.password) {
    loggerAdmin('error', ResMsg(16), `[loginController.js ${ResMsg(16)}]`);
    responseEnd(ResJson(463, ResMsg(16)), res);
  } else {
    await getLoginData(body, true, 'LoginController.js', res);
  }

}

export default Login;