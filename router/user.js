const express = require('express');
const userRouter = express();
const userController = require('../controller/userController');
const paytmController = require('../controller/paytmController');
const isAuth = require('../middleware/is-Auth')
const { check, body } = require('express-validator/check');
const bcrpt = require('bcrypt');
const User = require('../model/user');

userRouter.get('/signup', userController.getSignup);
userRouter.post('/signup',
    [
        body('firstName', 'First name is required').not().isEmpty(),
        body('lastName', 'Last name is required').not().isEmpty(),
        body('email').isEmail().withMessage('Please enter valid email').custom((value, { req }) => {
            return User.findOne({ email: req.body.email })
                .then(user => {
                    if (user) {
                        return Promise.reject(
                            'This email id is already taken'
                        );
                    }
                    return true
                })
        }).normalizeEmail(),
        body('password', "Password should be atleast min 8 characters").isLength({ min: 8 }).trim(),
        body('confirmPassword').custom((value, { req }) => {
            if (value === req.body.password) {
                return true;
            }
            throw new Error('Password and confirmpassword should be same');
        })
    ],
    userController.createUser);
userRouter.get('/log-in', userController.getLoginUser);
userRouter.post('/log-in', [
    body('email', 'Email is required').isEmail().custom((value, { req }) => {
        return User.findOne({ email: req.body.email })
            .then(user => {
                if (user) {
                    return true
                }
                return Promise.reject(
                    'User with this email id not available'
                );
            })
    }),
    body('password', 'Password is required').not().isEmpty().custom((value, { req }) => {
        return User.findOne({ email: req.body.email })
            .then(user => {
                return bcrpt.compare(value, user.password)
                    .then(hashedPassword => {
                        if (hashedPassword) {
                            return true;
                        }
                        return Promise.reject("Invalid password")
                    })
            })
    })
], userController.postLoginUser);
userRouter.post('/log-out', userController.LoggedOut);
userRouter.get('/create-expenditure', isAuth, userController.getCreateExpenditure);
userRouter.post('/create-expenditure', isAuth, userController.postExpenditure);
userRouter.post('/forgot-password', userController.postForgotPassword);
userRouter.get('/password-reset', userController.getPasswordReset);
userRouter.post('/reset-password',
    body('password', 'Password is required').not().isEmpty().custom((value, { req }) => {
        if (value === req.body.confirmPassword){
            return true
        }
        return Promise.reject("Password and confirm password should be same")
            

    }), userController.postResetPassword);
module.exports = userRouter;