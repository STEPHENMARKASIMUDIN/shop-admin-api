import { Response, Request, Router } from 'express';
import { mlShopFTP, PermitQuery, createFileStream, isTypeValid, responseEnd } from '../helpers';
import { join, format } from 'path';
import loggerAdmin from '../helpers/logger';
import ResJson from '../helpers/ResJson';
import ResMsg from '../helpers/ResMsg';
import * as Client from 'ftp';
import { createWriteStream, fstat, unlink } from 'fs';
import { basename } from 'path';
import { Stream } from 'stream';

function downloadPermit(req: Request, res: Response) {
  const client: Client = mlShopFTP(), qry: PermitQuery = req.query;
  try {
    if (!qry.shopName || !qry.permitType || !isTypeValid(qry.permitType)) {
      loggerAdmin('error', ResMsg(16), `[downloadPermitController.js ${ResMsg(16)}]`);
      responseEnd(ResJson(463, ResMsg(16)), res);
    } else {
      client.list(`${qry.shopName}/permits`, (e, files) => {
        if (e) {
          if (e.code == 550) {
            responseEnd(ResJson(404, `No File Found.`), res);
          } else {
            responseEnd(ResJson(500, ResMsg(0)), res);
          }
        } else {
          //const fileFilter = files.filter(file => file.name.includes(`${qry.shopName}_${qry.permitType}`));
          const fileFilter = files.filter(file => file.name.includes(`${qry.permitType}`));
          if (!fileFilter.length) {
            loggerAdmin('error', `File ${ResMsg(404)}`, `[downloadPermitController.js File ${ResMsg(404)}]`);
            responseEnd(ResJson(463, `File ${ResMsg(404)}`), res);
          } else {
            const getFileFTPCB = (e, stream: Stream) => {
              if (e) {
                loggerAdmin('fatal', e.message, '[downloadPermitController.js getFileFTPCB]');
                responseEnd(ResJson(500, ResMsg(0)), res);
              } else {
                const filePath = join(__dirname, process.env.PermitImagesPath, fileFilter[0].name);

                res.writeHead(200, {
                  'Transfer-Encoding': 'chunk',
                  'Content-Type': 'application/pdf',
                  'Content-disposition': `attachment; filename=${fileFilter[0].name}`
                })
                stream.pipe(res);
                stream.on('close', function () {

                  // unlink(filePath, e => {
                  //   if (e) {
                  //     loggerAdmin('error',
                  //       `File: ${basename(filePath)} | ${e.message}`,
                  //       `[downloadPermitController.js File Cant Be Deleted.]`);
                  //   } else {
                  //     loggerAdmin('info',
                  //       `File: ${basename(filePath)} Deleted`,
                  //       `[downloadPermitController.js File Deleted.]`);
                  //   }
                  // })
                })

                // await createFileStream(stream, filePath);
                // res.writeHead(200, {
                //   'Content-Type': 'application/pdf',
                //   'Content-Size': fileFilter[0].size
                // })
              }
            }
            client.get(`${qry.shopName}/permits/${fileFilter[0].name}`, getFileFTPCB);
          }
        }
      });
    };
  } catch (e) {
    loggerAdmin('error', e.message, `[downloadPermitController.js catch]`);
    responseEnd(ResJson(500, ResMsg(0)), res);
  }
}


export default downloadPermit;