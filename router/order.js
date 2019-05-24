const express = require('express');
const Router = express.Router();
const orderController = require('../controller/orderController')
const {body} = require('express-validator/check');
const isAuth = require('../middleware/is-Auth');
const paytmController = require('../controller/paytmController');


Router.get('/place-order',isAuth, orderController.getOrder);
Router.post('/place-order', isAuth,[
    body('orderAmount').not().isEmpty().withMessage('Should not empty').isNumeric().withMessage('Numbers only allowed')
], orderController.postOrder);
Router.get('/payment-status',isAuth, paytmController.paymentStatus);
Router.get('/transactions',isAuth,orderController.homeTransaction);
Router.post('/get-transaction-history',isAuth, orderController.getTransactionHistory);

module.exports= Router;