const checksum = require('../model/checksum');
const config = require('../config/config');
const Transaction = require('../model/transaction');
const Expenditure = require('../model/expenditure');
const { responsePayment } = require("../service/paytm");
const User = require('../model/user')


exports.pgredirect = (req, res, next) => {
    console.log("in pgdirect");
    res.render('pgredirect', {
        pageTitle: "Do not refresh",
        path: '/predirect'
    });
}

exports.response = async (req, res, next) => {

    // console.log(`From response success+ = ${success}`);
    // res.render("response", { resultData: "true", responseData: success });
    try {
        const success = await responsePayment(req.body)
        const trans = new Transaction({
            orderId: success.ORDERID, userId: req.session.user._id, txnPaymentId: success.TXNID,
            BankTxnId: success.BANKTXNID, totalAmount: success.TXNAMOUNT, currency: success.CURRENCY, paymentStatus: success.STATUS,
            resCode: success.RESPCODE, resMessage: success.RESPMSG, paymentTxnDate: success.TXNDATE, gateWayName: success.GATEWAYNAME,
            bankName: success.BANKNAME, paymentMode: success.PAYMENTMODE, billNo: success.BIN_NUMBER, cardLastNo: success.CARD_LAST_NUMS
        })
        let date = new Date(trans.paymentTxnDate);
        let month = date.getMonth();
        let fullYear = date.getFullYear();
        let monthName = getMonth(month);

        const transaction = await trans.save();
        const expenditure = await Expenditure.findOne({ expenditureMonth: monthName, expenditureYear: fullYear });
        console.log(expenditure);
        if (expenditure) {
            expenditure.transactions.push(transaction)
            if (transaction.paymentStatus === "TXN_SUCCESS") {
                expenditure.totalAmount += parseInt(transaction.totalAmount);
            }
            const savedExpend = await expenditure.save();
        } else {

            let expend = new Expenditure({
                expenditureMonth: monthName,
                expenditureYear: fullYear,
                totalAmount: 0
            })
            if (transaction.paymentStatus === "TXN_SUCCESS") {
                expend.totalAmount += parseInt(transaction.totalAmount);
            }
            expend.transactions.push(transaction);
            const savedExpend = await expend.save();
        }

        req.session.lastTrans = transaction;
        const session = req.session.lastTrans.save();
        const user = await User.findOne({ email: req.session.user.email })
        user.transactions.push(transaction)
        const userTransaction = await user.save();

        res.redirect('/payment-status');

    } catch (err) {
        console.log(err);

    }

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


// const trans = new Transaction({
//     orderId: success.ORDERID, userId: req.session.user._id, txnPaymentId: success.TXNID,
//     BankTxnId: success.BANKTXNID, totalAmount: success.TXNAMOUNT, currency: success.CURRENCY, paymentStatus: success.STATUS,
//     resCode: success.RESPCODE, resMessage: success.RESPMSG, paymentTxnDate: success.TXNDATE, gateWayName: success.GATEWAYNAME,
//     bankName: success.BANKNAME, paymentMode: success.PAYMENTMODE, billNo: success.BIN_NUMBER, cardLastNo: success.CARD_LAST_NUMS
// })
// let transac;
// let date = new Date(trans.paymentTxnDate);
// let month = await date.getMonth();
// let fullYear = await date.getFullYear();
// let monthName = await getMonth(month);
// console.log(monthName);
// console.log(trans.paymentTxnDate);
// Expenditure.findOne({ expenditureMonth: monthName, expenditureYear: fullYear })
//     .then(expenditure => {
//         if (expenditure) {
//             trans.save()
//                 .then(tran => {
//                     req.session.lastTrans = tran;
//                     req.session.lastTrans.save();
//                     if (tran.paymentStatus === "TXN_SUCCESS") {
//                         expenditure.totalAmount += parseInt(tran.totalAmount);

//                     }
//                     expenditure.transactions.push(tran);
//                     return expenditure.save()
//                 })
//                 .then(result => {
//                     res.redirect('/payment-status');
//                 })
//                 .catch(err => console.log(err))
//         } else {
//             return trans.save()
//         }
//     })
//     .then(tran => {
//         transac = tran
//         expend = new Expenditure({
//             expenditureMonth: monthName,
//             expenditureYear: fullYear
//         })
//         if (tran.paymentStatus === "TXN_SUCCESS") {
//             expend.totalAmount += parseInt(trans.totalAmount);
//         }
//         expend.transactions.push(transac);
//         return expend.save()
//     })
//     .then(data => {
//         User.findOne({ email: req.session.user.email })
//             .then(user => {
//                 user.transactions.push(transac);
//                 return user.save()
//             })
//             .then(user => {
//                 req.session.lastTrans = transac;
//                 req.session.lastTrans.save((result) => {
//                     res.redirect('/payment-status');
//                 });
//             })
//             .catch(err => console.log(err))

//     })
//     .catch(err => console.log(err));
