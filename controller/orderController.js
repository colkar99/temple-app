const Order = require('../model/order')
const checksum = require('../model/checksum');
const config = require('../config/config');
const { validationResult } = require('express-validator/check');
const { initPayment } = require("../service/paytm");
const Transaction = require('../model/transaction');
const Expenditure = require('../model/expenditure');
const User = require('../model/user');

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

exports.postOrder = async (req, res, next) => {


    try {
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
        const savedOrder = await order.save();
        const initPayments = await initPayment(req.body.orderAmount, savedOrder._id, user._id);
        const newUser = await User.findOne({ email: user.email });
        newUser.orders.push(savedOrder);
        const savedUser = newUser.save();
        res.render("pgredirect", {
            resultData: initPayments,
            path: '',
            paytmFinalUrl: process.env.PAYTM_FINAL_URL,
            csrfToken: req.csrfToken()

        });
    } catch (errors) {
        console.log(errors);
    }



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
            .populate([{ path: 'transactions', populate: { path: 'userId' } }, 'transactions.userId', 'expenditures.spendUser', 'expenditures.updatedUser'])
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
