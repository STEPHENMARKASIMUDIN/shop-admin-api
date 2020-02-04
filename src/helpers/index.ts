import * as express from 'express';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as Bluebird from 'bluebird';
import * as cors from 'cors';
import * as Client from 'ftp';
import ResMsg from './ResMsg';
import loggerAdmin from './logger';
import ResJson, { ResponseJson } from './ResJson';
import { Stream } from 'stream';
import { join, basename } from 'path';
import { json, urlencoded } from 'body-parser';
import { AES, enc } from 'crypto-js';
import { createServer, Server } from 'http';
import { createLogger, transports } from 'winston';
import { sign, verify, VerifyErrors } from 'jsonwebtoken';
import { Options, get, RequestCallback } from 'request';
import { Request, Response, NextFunction } from 'express';
import { SendMailOptions, createTransport } from 'nodemailer';
import { mkdir, createWriteStream, PathLike, ReadStream, createReadStream } from 'fs';
import {
  PoolConnection, QueryOptions, QueryError, Pool,
  createPool, RowDataPacket, OkPacket
} from 'mysql2';
import Query from '../Query';




export function responseEnd(responseAdmin: ResponseJson, res: Response) {
  return res.json({ ...responseAdmin }).end();
}




// export function generateNewPassword() {
//   const opts: Options = {
//     excludeSimilarCharacters: true,
//     exclude: "')({}[]/\\|",
//     strict: true,
//     length: 15
//   }
//   return generate(opts);
// }





// export const generateSaltAsync = (): Promise<string | Error> => {
//   return new Promise((resolve, reject) => {
//     genSalt(10, (e, salt) => e ? (loggerAdmin('fatal', e.message, `[generateSaltAsync() err]`), reject(e)) : resolve(salt));
//   })
// }


// export const hashPassword = (password: string): Promise<string | Error> => {
//   return new Promise(async (resolve, reject) => {
//     const salt = <string>(await generateSaltAsync());
//     hash(password, salt, (e, hash) => e ? (loggerAdmin('error', e.message, `[hashPassword() err]`), reject(e)) : resolve(hash))
//   })
// };


// export const compareAsync = (password: string, hash: string): Promise<boolean | Error> => {
//   return new Promise((resolve, reject) => {
//     compare(password, hash, (e: Error, isValid: boolean) => {
//       return e ? (loggerAdmin('error', e.message, `[compareAsync() err]`), reject(e)) : resolve(isValid);
//     })
//   })
// }

/**
 * Encrypts the password parameter.
 * 
 * @param {String} password 
 * @returns encrypted password
 */
export const encryptPassword = (password: string): string => {
  const KEY = <string>(process.env.CRYPTO_SECRET_KEY);
  return AES.encrypt(password, KEY).toString();
};

/**
 * Decrypts the password parameter.
 * 
 * @param encryptedPass 
 * @returns decrypted password
 */
export const decryptPassword = (encryptedPass: string): string => {
  const KEY = <string>(process.env.CRYPTO_SECRET_KEY);
  return AES.decrypt(encryptedPass, KEY).toString(enc.Utf8);
}

/**
 * Generates a JWT token based on the data parameter.
 * @param data 
 * @returns Either a rejected promise with reason or the resolved promise with the token
 */
export const makeToken = (data: object | string): Promise<string> => {
  const SECRET_KEY = <string>(process.env.JWT_SECRET_KEY);
  return new Promise((resolve, reject) => {
    sign(data, SECRET_KEY, { expiresIn: '1hr' }, (e: Error, token: string) => {
      return e ? (loggerAdmin('error', e.message, `[makeToken() catch]`), reject(e)) : resolve(token)
    })
  })
};

/**
 * A middleware that checks if the request has a valid token.
 * 
 * Note: 
 * 
 * @param req 
 * @param res 
 * @param nxt 
 */
export const verifyToken = (req: Request, res: Response, nxt: NextFunction) => {
  try {
    const SECRET_KEY = <string>(process.env.JWT_SECRET_KEY);
    const headerAuth = <string>(req.headers.authorization);
    if (!headerAuth) {
      return res.json(ResJson(401, ResMsg(401))).end();
    } else {
      const [b, token] = headerAuth.split(' ');
      console.log(token);
      verify(token, SECRET_KEY, (e: VerifyErrors, decoded: string | object) => {
        if (e) {
          loggerAdmin('error', e.message, `${req.path} verify err`);
          res.json(ResJson(401, ResMsg(401))).end()
        } else {
          req['user_data'] = decoded;
          nxt();
        }
      })
    }
  } catch (e) {
    loggerAdmin('error', e.message, `[verifyToken() catch]`)
    return res.json(ResJson(401, ResMsg(401))).end();
  }
};




export interface SendMailFuncOptions {
  sellerEmail: string
  message: string
  response: Response
  messageOccured: string
  html?: string
  isChangePassword?: boolean
  newPassword?: string
}


export interface LoginBody {
  username: string
  password: string
}

export interface EnableSellerBody {
  email: string
  merchantID: string | number
}

export interface SendMailBody {
  sellerEmail: string
  message: string
}


export function checkValidDate(date: string): date is string {
  let [year, month, day] = date.split('-');
  if (!year || !month || !day) {
    return false;
  } else if (!isYearValid(year) || !isMonthValid(month)) {
    return false;
  } else {
    return checkMonthAndDay(month, day, year);
  }
}

/**
 * Tests if the provided 'month' param is valid
 * 
 * @example
 * isMonthValid('02') -> true
 * isMonthValid('22') -> false
 * isMonthValid('11') -> true
 * 
 * @param month 
 */
export function isMonthValid(month: string): month is string {
  const months: string[] = ['01', '02', '03', '04', '05', '06',
    '07', '08', '09', '10', '11', '12'];
  return months.indexOf(month) >= 0;
}

export function genFileName(date: string) {
  return `${logPath().substring(0, logPath().lastIndexOf('\\'))}\\${basename(logPath()).substring(0, 15)}${date}.loggerAdmin`
}

export function isYearValid(year: string): year is string {
  return year.length != 4 ? false : true;
}
export function isDayValid(numDay: number, month: string, year: string): boolean {
  if (month == "02" && isLeapYear(year) && (numDay >= 1 && numDay <= 29)) {
    return true;
  } else if (month == "02" && !isLeapYear(year) && (numDay >= 1 && numDay <= 28)) {
    return true;
  } else {
    return false;
  }
}


export function checkMonthAndDay(month: string, day: string, year: string): boolean {
  const ThirtyOnes: string[] = ['01', '03', '05', '07', '08', '10', '12'];
  const numDay = +day;
  if (ThirtyOnes.indexOf(month) >= 0 && (numDay >= 1 && numDay <= 31)) {
    return true;
  } else if (month != "02" && (numDay >= 1 && numDay <= 30)) {
    return true;
  } else {
    return isDayValid(numDay, month, year);
  }

}

/**
 * Tests if the provided year is a leap year.
 * 
 * 
 * @example 
 * isLeapYear(2000) -> true
 * isLeapYear(1993) -> false
 * isLeapYear(2004) -> true
 * 
 * @param year 
 * @return {Boolean}
 */
export function isLeapYear(year: string): year is string {
  let numYear = Number(year);
  return (numYear % 4 === 0 && numYear % 100 !== 0) || (numYear % 400 === 0);
}


export function sendMail(o: SendMailFuncOptions): void {
  const transporter = createTransport({
    host: process.env.SMTPHost,
    port: process.env.SMTPPort,
    secure: false,
    auth: {
      user: process.env.SMTPUser,
      pass: process.env.SMTPPass
    }
  });

  let html = o.html;
  if (o.isChangePassword) {
    html = `<h6 style="display:none">New password</h6>: ${o.newPassword}`
  }

  const sendMailOptions: SendMailOptions = {
    from: process.env.SMTPSender,
    to: o.sellerEmail,
    subject: 'ML Shop',
    html,
    text: html ? null : o.message
  };


  transporter.sendMail(sendMailOptions, (e, info) => {
    if (e) {
      loggerAdmin('fatal', e.stack, `[${o.messageOccured} sendMail() Error]`);
      responseEnd(ResJson(500, ResMsg(28)), o.response);
      //return o.response.json(ResJson(500, ResMsg(28))).end();
    } else {
      loggerAdmin('info', `Success in Sending Email.`, `[${o.messageOccured} sendMail() Success]`);
      loggerAdmin('info', info, `[${o.messageOccured} sendMail() Success]`);
      responseEnd(ResJson(200, ResMsg(27)), o.response);
      // return o.response.json(ResJson(200, !o.messageOccured ? ResMsg(27) : o.message)).end();
    }
  });

  transporter.close();

}


export const timeout: number = 40000;



export interface ChangePasswordBody {
  merchantID: string | number
  email: string
  newPassword: string
}

export interface DenySellerBody {
  merchantID: string | number
  email: string
}

export interface MLShopAdminRoutes {
  path: string,
  router: express.Router
}


export interface ServiceUtilityResponse {
  ResponseCode: number
  ResponseMessage: string
  loginData: any | object
}

export interface EditSellerBody {
  merchantID: string | number
  merchantName: string
  shopName: string
  email: string
  storeAddress: string
  city: string
  country: string
  contactNumber: string | number
  storeDescription: string
}


export function sendLogsContents(pathToFile: PathLike, res: Response) {
  let stream: ReadStream, fileContents: string = '';
  stream = createReadStream(pathToFile, { flags: 'r', });

  //stream.pipe(res);

  stream.on('data', (chunk: Buffer) => {
    let str = chunk.toString();
    fileContents += `${str} \n`;


  })
  stream.on('end', () => {
    return res.send(fileContents).end();
  })
  stream.on('error', e => {
    if (e) {
      if (e.code == 'ENOENT') {
        return res.send('No Log File Detected.').end();
      } else {
        loggerAdmin('fatal', e.message, `[checkLogsController.js stream.on('error')]`);
        return res.json(ResJson(500, ResMsg(0))).end();
      }
    }
  });
}


/**
 * 
 * A utility class that helps making database queries,transactions easier and faster.
 * 
 * Note: Configuration must be in the ".env" file
 * 
 * @example
 * ".env"
 * DBHost = "Your DB Host"
 * DBPort = "Your DB Port" //defaults to 3306
 * DBUser = "Your DB User"
 * DBPass = "Your DB Pass"
 * 
 * 
 * @class
 * @constructor
 * 
 */

export class MLSQL {

  /** 
   * Pool instance from database
   * @property pool
   * @type Pool
   */
  pool: Pool


  /** 
   * An connection instance from the Pool
   * @public
   * @property connection
   * @type {PoolConnection} 
   */
  connection: PoolConnection

  /** 
   * A boolean that indicates if the MLSQL instance is connected to the database or not.
   * @private
   * @property _isConnected
   * @type {boolean}
   */
  private _isConnected: boolean = false


  constructor() {
    this.pool = createPool({
      host: process.env.DBHost,
      port: +process.env.DBPort,
      user: process.env.DBUser,
      password: process.env.DBPass,
      connectionLimit: 5000,
    })


  }



  /**
   * Establishes a connection to the database.
   * 
   * Returns a rejected promise if something went wrong when connecting to the database.
   * 
   * @method
   * @member
   */
  establishConnection() {
    return new Bluebird.Promise((res, rej) => {
      this.pool.getConnection((e, con) => {
        return e ? rej(e) : (this._isConnected = true, this.connection = con, res(con));
      })
    })
  }



  /**
   * Makes a query call to the database.
   * 
   * Note: Use the transaction method if your query consists of modifying or updating the database.
   * 
   * Returns a rejected promise if something went wrong with the query.
   * 
   * 
   * @method
   * @param options 
   */
  query(options: QueryOptions) {
    if (this._isConnected) {
      return new Bluebird.Promise((res, rej) => {
        this.connection.query(options, (e: QueryError, rows: RowDataPacket) => {
          return e ? rej(e) : res(rows);
        })
      })
    }
  }



  /**
  * Makes a transaction call to the database.
  * 
  * Note: Use this method if your query consists of modifying or updating the database else use the query method.
  * 
  * Returns a rejected promise if something went wrong with the transaction.
  * 
  * 
  * @method
  * @param options 
  */
  transaction(options: QueryOptions) {
    if (this._isConnected) {
      return new Bluebird.Promise((res, rej) => {
        this.connection.beginTransaction(e => {
          if (e) { rej(e); }
          else {
            this.connection.query(options, (e: QueryError, rows: OkPacket) => {
              if (e) {
                this.rollback();
                rej(e);
              }
              else {
                return rows.affectedRows ? (this.commit(), res(rows)) : (this.rollback(), res(rows));
              }
            })
          }
        })
      })
    }
  }



  /**
   * Rollbacks the current transactions.
   * 
   * Note: Use this method in case something error occurred on your last transaction.
   */
  rollback() {
    if (this._isConnected) {
      this.connection.rollback(() => { console.log(`Rollbacked`) });
    }
  }


  /**
   * Releases the connection pool instance to the Pool.
   */
  releaseCon() {
    if (this._isConnected) {
      this.connection.release();
    }
  }


  /**
   * Commits the current transactions to the database.
   */
  commit() {
    if (this._isConnected) {
      this.connection.commit();
    }
  }

}


export const logPath = (): string => {
  const env = process.env.NODE_ENV;
  return env == "development" ? join(__dirname, process.env.LogsDevPath, logsFileName())
    : join(process.env.LogsProdPath, '/MLShopAdminLogs', logsFileName());
}


export const logger = () => {
  return createLogger({
    transports: [
      new transports.File({
        filename: logPath(),
        level: "info",
        maxFiles: 3,
        maxsize: 5242880,
      })]
  });
}



export function createFileStream(stream: Stream, filePath: string) {
  return new Bluebird.Promise((res, rej) => {
    stream.pipe(createWriteStream(filePath));
  })
}



/**
 * Tests if the provided permit is valid
 * 
 * @example
 * isTypeValid('valid_id') -> true
 * isTypeValid('police_clearance') -> true
 * isTypeValid('police_clearancee') -> false
 * isTypeValid() -> false
 * 
 * @param {String} permit 
 */
export function isTypeValid(permit?: string): permit is string {
  if (!permit) {
    return false;
  } else {
    const permitTypes = [
      'brgy_clearance',
      'business_permit',
      'police_clearance',
      'valid_id'
    ];
    let isValid: boolean = permitTypes.indexOf(permit.toLowerCase()) >= 0;
    return isValid;
  }
}

export interface PermitQuery {
  shopName: string
  permitType: string
}

/**
 * @returns FTP Client instance
 */
export const mlShopFTP = () => {
  const c = new Client();

  c.connect({
    host: process.env.FTPHost,
    port: +process.env.FTPPort,
    user: process.env.FTPUser,
    password: process.env.FTPPass,
    connTimeout: 150000,
    keepalive: 15000
  })

  return c;
}





export class App {

  app: express.Application;
  authRoutes: string[]
  constructor(private routes: MLShopAdminRoutes[], routesWithAuth: string[]) {
    this.createDir();
    this.app = express();
    this.app.set('env', process.env.NODE_ENV);
    this.authRoutes = routesWithAuth;
    this.initializeMiddleWares();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.routes.forEach(route => {
      if (this.authRoutes.indexOf(route.path) >= 0) {
        this.app.use(route.path, verifyToken, route.router)
      } else {
        this.app.use(route.path, route.router)
      }
    });
    this.initialize404s();
  }

  private initialize404s = (): void => {
    this.app.get("*", (req, res): express.Response => {
      loggerAdmin('error', `${ResMsg(404)} ${req.path}`, '[App.get: mlshopadminAPI app.get()]');
      return res.status(404).json(ResJson(404, ResMsg(404)));
    });

    this.app.post("*", (req, res): express.Response => {
      loggerAdmin('error', `${ResMsg(404)} ${req.path}`, '[App.get: mlshopadminAPI app.post()]');
      return res.status(404).json(ResJson(404, ResMsg(404)));
    });
  }


  private createDir() {

    mkdir(join(process.env.LogsProdPath, '/MLShopAdminLogs'), e => {
      if (e) {
        if (e.code == 'EEXIST') {
          console.log(`Directory for Logs Already Exists!`);
          return;
        }
      }
      console.log('Directory Logs Created!');
    });
    mkdir(join(__dirname, process.env.PermitImagesPath), e => {
      if (e) {
        if (e.code == 'EEXIST') {
          console.log(`Directory Images Already Exists!`);
          return;
        }
      }
      console.log('Directory Images Created!');
    })
  }

  private initializeMiddleWares(): void {
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(cors());
    this.app.use(json());
    this.app.use(urlencoded({ extended: false }));
  }

  public listen(): Server {
    return createServer(this.app).listen(process.env.PORT, () => {
      console.log(`Server listening at port ${process.env.PORT}`);
    })
  }
}

export interface SellerDetailsBody {
  merchantID: string | number
}

export interface DisableSellerBody {
  merchantID: number | string
  email: string
}

export function makeDate(date?: string): Date | string {
  try {
    let d = <Date | string>new Date(date);
    return d === 'Invalid Date' ? new Date() : d;
  } catch (e) {
    return new Date();
  }
}

export function month(d?: Date | string): string {
  if (typeof d === 'string') {
    d = <Date>makeDate(d);
    d = (d.getMonth() + 1).toString();
    return d.length == 1 ? `0${d}` : d;
  }
  let m = (d.getMonth() + 1).toString();
  return m.length == 1 ? `0${m}` : m;
}

export function year(d?: Date | string): string {
  if (typeof d === 'string') {
    d = <Date>makeDate(d);
    return d.getFullYear().toString();
  }
  return d.getFullYear().toString();
}


export function day(d?: Date | string): string {
  let day: string = '';
  if (typeof d === 'string') {
    d = <Date>makeDate(d);
    day = d.getDate().toString();
    return day.length == 1 ? `0${day}` : day;
  }
  day = d.getDate().toString();
  return day.length == 1 ? `0${day}` : day;
}

/**
 * Generates a Log Filename.
 * 
 * @returns log filename
 */
export function logsFileName(): string {
  let d = new Date();
  return `MLShopAdminLogs${year(d)}-${month(d)}-${day(d)}.log`;
}

export function formatDate(seller: any): any {
  const d = new Date(seller.syscreated);
  seller.syscreated = `${year(d)}-${month(d)}-${day(d)}`;
  return seller;
}

export async function getLoginData(body: LoginBody, isLogin: boolean, messageOccurred: string, res: Response) {
  let mlsql: MLSQL, resultQry: OkPacket, token: string = '', d: Date, tableName: string = '', noAffectedRows: boolean = false, retries: number = 0;
  function next() {
    retries++;
    const loginRequestCallback: RequestCallback = async (e: Error, r, result: ServiceUtilityResponse) => {
      try {
        if (e) {
          loggerAdmin('error', e.message, `[loginController.js Login Request catch]`);
          return responseEnd(ResJson(500, ResMsg(0)), res)
        } else {
          switch (result.ResponseCode) {
            case 200:
              if (isLogin) {
                token = await makeToken({ username: body.username, password: encryptPassword(body.password) });
                d = new Date(), tableName = `shopsession${year(d)}${month(d)}${day(d)}.sessiondetails`;
                mlsql = new MLSQL();
                await mlsql.establishConnection();
                resultQry = <OkPacket>await (mlsql.transaction({ sql: Query(9), values: [tableName, token], timeout }))
                mlsql.releaseCon();
                noAffectedRows = resultQry.affectedRows ? false : true
              }
              if (!noAffectedRows) {
                token = isLogin ? token : undefined;
                return responseEnd({ ...ResJson(200, ResMsg(200)), loginData: { ...result.loginData, token } }, res)
              } else {
                return responseEnd(ResJson(500, ResMsg(0)), res)
              }
            case 401:
              return responseEnd(ResJson(401, ResMsg(401)), res)
            default:
              return responseEnd(ResJson(500, ResMsg(0)), res)
          }
        }
      } catch (e) {
        mlsql && mlsql.releaseCon();
        if (retries > 3) {
          loggerAdmin('error', e.message, `[${messageOccurred} catch]`);
          responseEnd(ResJson(500, ResMsg(0)), res);
        } else {
          loggerAdmin('error', e.message, `[${messageOccurred} catch]`);
          next();
        }
      }
    }
    const opts: Options = {
      url: `${process.env.Login_URL}Login`,
      strictSSL: false,
      qs: body,
      json: true,
      callback: loginRequestCallback
    }
    get(opts);
  }
  next();
}