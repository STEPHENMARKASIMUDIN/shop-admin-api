
import loginRoute from "./routes/loginRoute";
import logoutRoute from "./routes/logoutRoute";
import checkLogsRoute from './routes/checkLogsRoute';
import editSellerRoute from "./routes/editSellerRoute";
import sendMessageRoute from './routes/sendMessageRoute';
import denySellerRouter from "./routes/denySellerRoute";
import enableSellerRoute from "./routes/enableSellerRoute";
import getLoginDataRouter from "./routes/getLoginDataRoute";
import generateTokenRoute from "./routes/generateTokenRoute";
import disableSellerRouter from "./routes/disableSellerRoute";
import sellerDetailsRouter from "./routes/sellerDetailsRoute";
import searchBySellerRoute from "./routes/searchBySellerRoute";
import downloadPermitRoute from "./routes/downloadPermitRoute";
import changePasswordRoute from "./routes/changePasswordRoute";
import displaySellersRouter from "./routes/displaySellersRoute";
import checkConnectionRouter from "./routes/checkConnectionRoute";

import { join } from 'path';
import { config } from 'dotenv';
import { App, MLShopAdminRoutes } from "./helpers";


config({ path: join(__dirname, '../.env') });

const domain = '/mlshopadmin/api/v1/';

const routes: MLShopAdminRoutes[] = [
  {
    path: `${domain}login`,
    router: loginRoute
  },
  {
    path: `${domain}checkLogs`,
    router: checkLogsRoute
  },
  {
    path: `${domain}checkConnection`,
    router: checkConnectionRouter
  },
  {
    path: `${domain}generateToken`,
    router: generateTokenRoute
  },
  {
    path: `${domain}logout`,
    router: logoutRoute
  },
  {
    path: `${domain}displaySellers`,
    router: displaySellersRouter
  }, {
    path: `${domain}disableSeller`,
    router: disableSellerRouter
  }, {
    path: `${domain}sellerDetails`,
    router: sellerDetailsRouter
  }, {
    path: `${domain}denySeller`,
    router: denySellerRouter
  }, {
    path: `${domain}editSeller`,
    router: editSellerRoute
  }, {
    path: `${domain}downloadPermit`,
    router: downloadPermitRoute
  }, {
    path: `${domain}sendMessage`,
    router: sendMessageRoute
  }, {
    path: `${domain}searchSeller`,
    router: searchBySellerRoute
  }, {
    path: `${domain}enableSeller`,
    router: enableSellerRoute
  }, {
    path: `${domain}changePassword`,
    router: changePasswordRoute
  },
  {
    path: `${domain}getLoginData`,
    router: getLoginDataRouter
  }
];

const routesWithAuth: string[] = routes.map((route) => route.path).slice(4)

const app: App = new App(routes, routesWithAuth);

export {
  app
}