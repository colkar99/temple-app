const express = require('express');
const Router = express.Router();
const paytmController = require('../controller/paytmController');
const isAuth = require('../middleware/is-Auth');




Router.get('/pgredirect',isAuth, paytmController.pgredirect);
Router.post('/paytm-response', paytmController.response);


module.exports = Router
