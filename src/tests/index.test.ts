import * as request from "supertest";
import ResMsg from "../helpers/ResMsg";
import { app } from "../app";
import { Server } from "http";
import { isTypeValid, month, year, day, encryptPassword, decryptPassword } from "../helpers";
import ResJson from "../helpers/ResJson";
import { expect } from 'chai';


describe('Test routes ', () => {

  let service: Server;

  before(() => {
    service = app.listen();
  })
  it('should return 200 with route /mlshopadmin/api/v1/checkConnection', async () => {

    const resp = await request(service).get('/mlshopadmin/api/v1/checkConnection')
    expect(resp.body).to.be.deep.eq({
      ResponseCode: 200,
      ResponseMessage: "Success in connecting to Database."
    });
  });

  it('should return 463 with route /mlshopadmin/api/v1/login with lacking parameters', async () => {
    const resp = await request(service).post('/mlshopadmin/api/v1/login')
      .send({ email: 'mac21macky@gmail.com', pass: '123456' });

    expect(resp.body).to.be.deep.eq({
      ResponseCode: 463,
      ResponseMessage: ResMsg(16)
    });
  });

  it('should return 463 with route /mlshopadmin/api/v1/changePassword with lacking parameters', async () => {
    const resp = await request(service).post('/mlshopadmin/api/v1/changePassword')
      .send({ email: 'mac21macky@gmail.com', newPassword: '12345' });

    expect(resp.body).to.be.deep.eq(ResJson(401, ResMsg(401)));
  });
  it.skip('should return 401 with route /mlshopadmin/api/v1/changePassword with body send {email:"mac21macky@gmail.com",newPassword:"12346"}', async () => {
    const resp = await request(service).post('/mlshopadmin/api/v1/changePassword')
      .send({ email: 'mac21macky@gmail.com', newPassword: '12345', merchantID: 123456 });
    expect(resp.body).to.be.deep.eq(ResJson(401, ResMsg(401)));
  });
  it('should return 401 with route /mlshopadmin/api/v1/changePassword with body send {email:"mac21macky@gmail.com",newPassword:"12312312312321321312311",merchantID: 123456}', async () => {
    const resp = await request(service).post('/mlshopadmin/api/v1/changePassword')
      .send({ email: 'mac21macky@gmail.com', newPassword: '12312312312321321312311', merchantID: 123456 })
    expect(resp.body).to.be.deep.eq(ResJson(401, ResMsg(401)));
  });
  it('should return 463 with route /mlshopadmin/api/v1/denySeller with lacking parameters', async () => {
    const resp = await request(service).post('/mlshopadmin/api/v1/denySeller')
      .send({ email: "mac21macky@gmail.com" });
    expect(resp.body).to.be.deep.eq(ResJson(401, ResMsg(401)));
  });
  it('should return 200 with route /mlshopadmin/api/v1/denySeller with correct parameters', async () => {
    const resp = await request(service).post('/mlshopadmin/api/v1/denySeller')
      .send({ email: "blackbihon@ymail.com", merchantID: "201904020085" })
    expect(resp.body).to.be.deep.eq(ResJson(401, ResMsg(401)));
  });
  it('should return 404 with an unknown get route /mlshopadmin/api/v1/checkConnectionnn with no parameters',async () => {
    const resp = await request(service).get('/mlshopadmin/api/v1/checkConnectionnn');
    expect(resp.body).to.be.deep.eq(ResJson(404, ResMsg(404)));
  });
  it('should return 404 with an unknown post route /mlshopadmin/api/v1/denySellerr with no parameters', async () => {
    const resp = await request(service).post('/mlshopadmin/api/v1/denySellerr');
    expect(resp.body).to.be.deep.eq(ResJson(404, ResMsg(404)));
  });
  it('should return with token query user = marko_polo', async () => {
    const resp = await request(service).post('/mlshopadmin/api/v1/generateToken')
      .set({ Authorization: 'Bearer 12321321312321' })
      .query({ user: 'marko_polo' });
    expect(resp.body).to.have.property('token');

  });



  after((d) => {
    service.close(d);
  })

})


describe('Test year-month-day funcs', () => {
  it('should "20190527" with new Date()', () => {
    const d = new Date();
    expect(`${year(d)}${month(d)}${day(d)}`).to.be.eq("20190801");
  });
  it('should "20170312" with "2017-03-12"', () => {
    const d = "2017-03-12";
    expect(`${year(d)}${month(d)}${day(d)}`).to.be.eq("20170312");
  });
  it('should "20001105" with "2000/11/5"', () => {
    const d = "2000/11/5";
    expect(`${year(d)}${month(d)}${day(d)}`).to.be.eq("20001105");
  });
})


describe('Test isTypeValid func', () => {
  it('should true with param "BRGY_CLEARANCE"', () => {
    expect(isTypeValid("BRGY_CLEARANCE")).to.be.ok;
  });
  it('should false with param ""', () => {
    expect(isTypeValid("")).to.be.not.ok;
  });
  it('should true with param "business_permit"', () => {
    expect(isTypeValid("business_permit")).to.be.ok;
  });
  it('should false if param is undefined', () => {
    expect(isTypeValid()).to.be.false;
  });
});



describe('Test month func', () => {
  it('should return "08" with param new Date()', () => {
    expect(month(new Date())).to.be.eq("08");
  });
  it('should return "04" with param "2019-04-12"', () => {
    expect(month("2019-04-12")).to.be.eq("04");
  });
  it('should return "12" with param "2019/12/09"', () => {
    expect(month("2019/12/09")).to.be.eq("12");
  });
});


describe('Test year func', () => {
  it('should return "2019" with param new Date()', () => {
    expect(year(new Date())).to.be.eq("2019");
  });
  it('should return "2017" with param "2017/12/12"', () => {
    expect(year("2017/12/12")).to.be.eq("2017");
  });
  it('should return "2015" with param "2015-05-12"', () => {
    expect(year("2015-05-12")).to.be.eq("2015");
  });
})

describe('Test day func', () => {
  it('should return "01" with param new Date()', () => {
    expect(day(new Date())).to.be.eq("01");
  });
  it('should return "12" with param "2017/12/12"', () => {
    expect(day("2017/12/12")).eq("12");
  });
  it('should return "12" with param "2015-05-12"', () => {
    expect(day("2015-05-12")).eq("12");
  });
});


describe('Test ResMsg func', () => {
  it('should return "SUCCESS" with param 200', () => {
    expect(ResMsg(200)).eq("SUCCESS");
  });
  it('should return "No Data Found!" with param 400', () => {
    expect(ResMsg(400)).eq("No Data Found!");
  });
  it('should return "Password Successfully Changed." with param 32', () => {
    expect(ResMsg(32)).eq("Password Successfully Changed.");
  });
  it('should return "Unable to process request. The system encountered some technical problem. Sorry for the inconvenience." with no params provided', () => {
    expect(ResMsg()).eq("Unable to process request. The system encountered some technical problem. Sorry for the inconvenience.");
  });


})



describe('Test encrypt and decrypt func helpers', () => {
  let password: string, encryptedPass: string;
  before(() => {
    password = '123456';
    encryptedPass = encryptPassword(password);
  })


  it('should return true when decrypting password', () => {
    expect(decryptPassword(encryptedPass)).eq(password);
  })
  it('should return false when verifying decrypted password with wrong password', () => {
    expect(decryptPassword(encryptedPass)).to.be.not.eq('12321321');
  })


})



describe('Test jest', () => {
  it('should return without errors', () => {
    expect(1 + 1).to.eq(2);
  });
  it('should return async without errors', async () => {
    const somePromise = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(5)
        }, 1000);
      })
    }

    return expect(await somePromise()).to.eq(5);
  });
})
