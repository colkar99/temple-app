// 'use strict';
// var PAYTM_STAG_URL = 'https://pguat.paytm.com';
// var PAYTM_PROD_URL = 'https://secure.paytm.in';
// var MID = process.env.MID;
// var PAYTM_ENVIORMENT = 'TEST';   // PROD FOR PRODUCTION
// var PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY;
// var WEBSITE = process.env.WEBSITE;
// var CHANNEL_ID =  process.env.CHANNEL_ID;
// var INDUSTRY_TYPE_ID = process.env.INDUSTRY_TYPE_ID;
// var PAYTM_FINAL_URL = '';
// var CALLBACK_URL = process.env.CALLBACK_URL;
// if (PAYTM_ENVIORMENT== 'TEST') {
//   PAYTM_FINAL_URL = 'https://securegw-stage.paytm.in/theia/processTransaction';
 
// }else{
//   PAYTM_FINAL_URL = 'https://securegw.paytm.in/theia/processTransaction';
// }

// module.exports = {
//     MID: MID,
//     PAYTM_MERCHANT_KEY :PAYTM_MERCHANT_KEY,
//     PAYTM_FINAL_URL :PAYTM_FINAL_URL,
//     WEBSITE: WEBSITE,
//     CHANNEL_ID: CHANNEL_ID,
//     INDUSTRY_TYPE_ID: INDUSTRY_TYPE_ID,
//     CALLBACK_URL: CALLBACK_URL
// };
module.exports = {
  MID: process.env.MID,
  PAYTM_MERCHANT_KEY: process.env.PAYTM_MERCHANT_KEY,
  PAYTM_FINAL_URL: process.env.PAYTM_FINAL_URL,
  WEBSITE: process.env.WEBSITE,
  CHANNEL_ID: process.env.CHANNEL_ID,
  INDUSTRY_TYPE_ID: process.env.INDUSTRY_TYPE_ID,
  CALLBACK_URL: process.env.CALLBACK_URL
};
