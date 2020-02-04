/**
 * @function Query
 * @param qryNum 
 * 
 * @returns Returns the query string selected.
 * 
 * 
 * 0 - Get All Sellers - Parameters None
 * 
 * 1 - Disable Seller - Parameters "merchantID" and "email"
 * 
 * 2 - Edit Sellers - Parameters "sellerName" and "shopName" and "email" and "storeAddress" and "city" and "country" and "contactNumber" and "storeDescription" and "merchantID"
 * 
 * 3 - Seller Details - Parameters "sellerName" and "email"
 * 
 * 4 - Deny Seller  - Parameters "sellerName" and "email"
 * 
 * 5 - Login  - Parameters "email" and "password"
 * 
 * 6 - Search by Seller   - Parameters "sellerName"
 * 
 * 7 - Enable Seller  - Parameters "sellerName" and "email"
 * 
 * 8 - Change Password - Parameters "sellerName" and "email" and "newPassword"
 * 
 * 9 - Insert Token To DB 
 * @example
 *        const qry = Query(0);
 *        console.log(qry);
 *        // Logs SELECT id,merchantID,sellerName,shopName,
 *        // email,password,status,storeAddress,city,country,
 *        // contactNumber,storeDescription,zipcode,storeDetails,
 *        // storePolicies,paymentMethod,DATE(syscreated) syscreated,sysmodified from \`mlshop\`.\`merchantlist\`;;
 * 
 * 
 */

const Query = (qryNum: number): string => {

  switch (qryNum) {
    case 0:
      return `SELECT id,merchantID,sellerName,shopName,
          email,password,status,storeAddress,city,country,
          contactNumber,storeDescription,zipcode,storeDetails,
          storePolicies,paymentMethod,DATE(syscreated) syscreated,sysmodified from \`mlshop\`.\`merchantlist\`;`;
    case 1:
      return `UPDATE \`mlshop\`.\`merchantlist\` SET status = 3 WHERE merchantID = ? AND email = ?;`;
    case 2:
      return `UPDATE \`mlshop\`.\`merchantlist\`  SET  sellerName = ?,shopName= ?, email = ?, 
        storeAddress = ?, city = ?, country  = ?, contactNumber = ? ,storeDescription = ? WHERE merchantID = ?`;
    case 3:
      return `SELECT merchantID,sellerName,shopName,email,password,status,storeAddress,
      city,country,contactNumber,storeDescription,zipcode,storeDetails,storePolicies,paymentMethod,
        syscreated,sysmodified
       from \`mlshop\`.\`merchantlist\` WHERE merchantID = ? ;`;
    case 4:
      return `UPDATE \`mlshop\`.\`merchantlist\` SET status = 2 WHERE merchantID = ? AND email = ?;`;
    case 5:
      return `SELECT * FROM \`mlshop\`.\`Admin\` WHERE email = ? AND password = ? AND \`status\`=1;`;
    case 6:
      return `SELECT * FROM \`mlshop\`.\`merchantlist\` WHERE sellerName LIKE ?;`;
    case 7:
      return `UPDATE \`mlshop\`.\`merchantlist\`  SET \`status\` = 1 WHERE merchantID = ? AND email = ?;`;
    case 8:
      return `UPDATE \`mlshop\`.\`merchantlist\` SET  \`password\` = ? WHERE merchantID = ? AND email = ?;`;
    case 9:
      return `INSERT INTO ??(session_key,isExpired,expiration,created_at,updated_at) VALUES(?,0,(SELECT DATE_ADD(NOW(),INTERVAL 1 HOUR)),NOW(),NOW());`
    case 10:
      return `UPDATE ?? SET isExpired = 1 WHERE session_key = ?`;
    case 11:
      return 'SELECT NOW() as `date`';
    default:
      return `SELECT * from \`mlshop\`.\`merchantlist\`;`;

  }
}

export default Query;