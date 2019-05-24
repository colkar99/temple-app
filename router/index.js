const express = require('express');
const userRouter = express.Router();
// import controllers 
const indexController = require('../controller/indexController')


userRouter.get('/',indexController.getIndex);

module.exports = userRouter;