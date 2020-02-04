import { Request, Response } from 'express';
import { getLoginData as getData, decryptPassword } from '../helpers';



async function getLoginData(req: Request, res: Response) {
  await getData({
    username: req['user_data'].username,
    password: decryptPassword(req['user_data'].password)
  }, false, 'getLoginData', res);
}


export default getLoginData