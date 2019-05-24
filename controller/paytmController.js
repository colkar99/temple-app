const checksum = require('../model/checksum');
const config = require('../config/config');
const Transaction = require('../model/transaction');
const Expenditure = require('../model/expenditure');
const { responsePayment } = require("../service/paytm");


exports.pgredirect = (req, res, next) => {
    console.log("in pgdirect");
    res.render('pgredirect', {
        pageTitle: "Do not refresh",
        path: '/predirect'
    });
}

exports.response = (req, res, next) => {
    responsePayment(req.body).then(
        success => {
            // console.log(`From response success+ = ${success}`);
            // res.render("response", { resultData: "true", responseData: success });
            const trans = new Transaction({
                orderId: success.ORDERID, userId: req.session.user._id, txnPaymentId: success.TXNID,
                BankTxnId: success.BANKTXNID, totalAmount: success.TXNAMOUNT, currency: success.CURRENCY, paymentStatus: success.STATUS,
                resCode: success.RESPCODE, resMessage: success.RESPMSG, paymentTxnDate: success.TXNDATE, gateWayName: success.GATEWAYNAME,
                bankName: success.BANKNAME, paymentMode: success.PAYMENTMODE, billNo: success.BIN_NUMBER, cardLastNo: success.CARD_LAST_NUMS
            })
            let transac;
            let date = new Date(trans.paymentTxnDate);
            let month = date.getMonth();
            let fullYear = date.getFullYear();
            let monthName = getMonth(month);
            console.log(monthName);
            console.log(trans.paymentTxnDate);
            Expenditure.findOne({ expenditureMonth: monthName, expenditureYear: fullYear })
                .then(expenditure => {
                    if (expenditure) {
                        trans.save()
                            .then(tran => {
                                req.session.lastTrans = tran;
                                req.session.lastTrans.save();
                                if (tran.paymentStatus === "TXN_SUCCESS") {
                                    expenditure.totalAmount += parseInt(tran.totalAmount);

                                }
                                expenditure.transactions.push(tran);
                                return expenditure.save()
                            })
                            .then(result => {
                                res.redirect('/payment-status');
                            })
                            .catch(err => console.log(err))
                        // return console.log(result);
                    } else {
                        return trans.save()
                    }
                })
                .then(tran => {
                    transac = tran
                    expend = new Expenditure({
                        expenditureMonth: monthName,
                        expenditureYear: fullYear
                    })
                    if (tran.paymentStatus === "TXN_SUCCESS") {
                        expend.totalAmount += parseInt(trans.totalAmount);
                    }
                    expend.transactions.push(transac);
                    return expend.save()
                })
                .then(data => {

                    req.session.lastTrans = transac;
                    req.session.lastTrans.save((result) => {
                        res.redirect('/payment-status');
                    });
                })
                .catch(err => console.log(err));

        })
        .catch(err => {
            console.log(err);
        })
}

exports.paymentStatus = (req, res, next) => {
    if (req.session.lastTrans) {
        return res.render('paymentStatus', { pageTitle: 'Payment status', responseData: req.session.lastTrans, path: 'success' });
    }

    return res.redirect('/');

}
// exports.response = (req, res, next) => {
//     responsePayment(req.body).then(
//         success => {
//             // console.log("sdfsafafsfsdf"+ " = "+ success);
//             res.render("response", {resultData: "true", responseData: success});
//         })
//         .catch(err => console.log(err));
// }
const getMonth = (val) => {
    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    return months[val];

}


//   return trans.save()
//   .then(transData => {
//       req.session.lastTrans = transData;
//       return req.session.lastTrans.save();

//   })
//   .then( trans=>{
//       res.redirect('/payment-status');
//   })
//   .catch(err => console.log(err));