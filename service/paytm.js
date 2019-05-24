const checksum = require('../model/checksum');
const config = require('../config/config');
// const shortid = require('shortid');

const initPayment = function (amount,orderId,customerId) {
    return new Promise((resolve, reject) => {
        let paymentObj = {
            ORDER_ID: orderId.toString(),
            CUST_ID: customerId.toString(),
            INDUSTRY_TYPE_ID: config.INDUSTRY_TYPE_ID.toString(),
            CHANNEL_ID: config.CHANNEL_ID,
            TXN_AMOUNT: amount.toString(),
            MID: config.MID,
            WEBSITE: config.WEBSITE,
            CALLBACK_URL: config.CALLBACK_URL,
            MOBILE_NO: "7777777777"

        };
        // console.log(paymentObj);
        checksum.genchecksum(paymentObj, config.PAYTM_MERCHANT_KEY.toString(), (err, result) => {
            if (err) {
                return reject('Error while generating checksum');
            } else
                return resolve(result);
        });
    });
};

const responsePayment = function (paymentObject) {
    return new Promise((resolve, reject) => {
        if (checksum.verifychecksum(paymentObject, config.PAYTM_MERCHANT_KEY)) {
            resolve(paymentObject);
        } else {
            return reject('Error while verifying checksum');
        }
        ;
    });
};


module.exports = {
    initPayment: initPayment,
    responsePayment: responsePayment
}


