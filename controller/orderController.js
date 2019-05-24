const Order = require('../model/order')
const checksum = require('../model/checksum');
const config = require('../config/config');
const { validationResult } = require('express-validator/check');
const { initPayment } = require("../service/paytm");
const Transaction = require('../model/transaction');
const Expenditure = require('../model/expenditure');

exports.getOrder = (req, res, next) => {
    res.render('order/getOrder', {
        pageTitle: 'Order',
        path: '/donate',
        errorsMessage: null,
        oldDatas: {
            orderAmount: ""
        },
        csrfToken: req.csrfToken()
    });
}

exports.postOrder = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('order/getOrder', {
            pageTitle: 'Order',
            errorsMessage: errors.array(),
            oldDatas: {
                orderAmount: req.body.orderAmount
            },
            csrfToken: req.csrfToken()

        })
    }
    // console.log(req.body);
    if (!req.session.user) {
        res.render('user/login', {
            pageTitle: 'Login',
            csrfToken: req.csrfToken()

        })
    }
    const user = req.session.user;
    const currentDate = new Date();
    const order = new Order({
        orderAmount: req.body.orderAmount,
        userId: req.session.user,
        orderDate: currentDate.toString('dddd, MMMM ,yyyy')
    })
    order.save()
        .then(order => {
            // let paramlist = {ORDER_ID: order._id.toString(),CUST_ID: user._id.toString(),
            //     INDUSTRY_TYPE_ID: config.INDUSTRY_TYPE_ID,CHANNEL_ID: 'WEB',TXN_AMOUNT: "10",MID: config.MID,
            //     WEBSITE: "WEBSTAGING",PAYTM_MERCHANT_KEY:config.PAYTM_MERCHANT_KEY,CALLBACK_URL: config.CALLBACK_URL};
            // console.log(paramlist)
            initPayment(req.body.orderAmount, order._id, user._id).then(
                success => {
                    // success.MOBILE_NO = user.phoneNumber;
                    // success.EMAIL = user.email;
                    console.log(success);

                    res.render("pgredirect", {
                        resultData: success,
                        path: '',
                        paytmFinalUrl: process.env.PAYTM_FINAL_URL,
                        csrfToken: req.csrfToken()

                    });
                },
                error => {
                    console.log(error);
                    res.send(error);
                }
            );

        })
        .catch(err => console.log(err))
}

exports.homeTransaction = (req, res, next) => {

    res.render('transaction', {
        pageTitle: "Transactions",
        path: '/transaction',
        csrfToken: req.csrfToken()
    })
}

exports.getTransactionHistory = async (req, res, next) => {
    console.log(req.body);
    // next()
    const year = req.body.year;
    const month = req.body.month;

    // 2019-05-16T06:59:23.511+00:00
    // const startDate = `${year}-${month}-01T00:00:00`;
    // const endDate = `${year}-${month}-31T00:00:00`
    const compare = "2019-01-01T00:00:00.511+00:00";
    // console.log(startDate == compare);
    try {
        const expends = await Expenditure.find({ expenditureMonth: month, expenditureYear: year })
            .populate([{path: 'transactions',populate: {path: 'userId'}},'transactions.userId', 'expenditures.spendUser','expenditures.updatedUser'])
        // const transaction = await expends.transactions.find().populate('userId'); 
        // console.log(transaction);   
        // console.log(expends[0].transactions[0]);
        res.render('transactionHistory', {
            pageTitle: "Transaction history",
            path: "/transaction-history",
            transactions: expends[0]
        })
    } catch (error) {
        console.log(error);
    }


}


// try {
//     const transaction = await Transaction.find({
//         createdAt: {
//             $gte: startDate,
//             $lte: endDate
//         }
//     }).populate('userId')
//     let total = 0;
//     for (let tr of transaction) {
//         console.log(tr.totalAmount);
//         if (tr.paymentStatus == "TXN_SUCCESS") {
//             total += parseInt(tr.totalAmount);

//         }
//     }
//     res.render('transactionHistory', {
//         pageTitle: "Transaction history",
//         path: "/transaction-history",
//         totalAmountCollected: total,
//         transactions: transaction
//     })
// } catch (error) {
//     console.log(error);
// }
