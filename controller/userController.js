// import express from express
const bcrypt = require('bcrypt');
const User = require('../model/user');
const { validationResult } = require('express-validator/check')
const Expenditure = require('../model/expenditure');
const sendGridTransporter = require('nodemailer-sendgrid-transport');
const nodeMailer = require('nodemailer');
const transporter = nodeMailer.createTransport(sendGridTransporter({
    service: 'Sendgrid',
    auth: {
        api_key: process.env.API_KEY
    }
}))

exports.getSignup = (req, res, next) => {
    console.log(req.session.isLoggedin);
    res.render('user/signup', {
        pageTitle: "Signup",
        errorsMessage: null,
        path: '/signup',
        oldDatas: {
            firstName: "", lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            phoneNumber: ""
        },
        csrfToken: req.csrfToken()
    });
}

exports.createUser = (req, res, next) => {
    // console.log(req.body.email);
    // res.redirect('/');
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('user/signup', {
            pageTitle: "Signup",
            errorsMessage: errors.array(),
            path: '/signup',
            oldDatas: {
                firstName: req.body.firstName, lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                confirmPassword: req.body.confirmPassword,
                phoneNumber: req.body.phoneNumber
            },
            csrfToken: req.csrfToken()

        })
    }
    bcrypt.hash(password, 14)
        .then(hashedPswd => {
            const user = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: hashedPswd,
                phoneNumber: req.body.phoneNumber
            })
            return user.save()
        })
        .then(user => {
            res.redirect('/log-in');
        })
        .catch(err => console.log(err));
}

exports.getLoginUser = (req, res, next) => {
    res.render('user/login', {
        pageTitle: "Log-in",
        path: "/login",
        errorsMessage: null,
        oldDatas: {
            email: "",
            password: ""
        },
        csrfToken: req.csrfToken(),
        passwordReset: null


    });
}

exports.postLoginUser = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('user/login', {
            pageTitle: "Log-in",
            path: "/login",
            errorsMessage: errors.array(),
            oldDatas: {
                email: req.body.email,
                password: req.body.password
            },
            csrfToken: req.csrfToken(),
            passwordReset: null

        })
    }

    User.findOne({ email: email })
        .then(user => {
            req.session.isLoggedin = true; // seeting sessions
            req.session.user = user;
            req.session.save((result) => {
                res.redirect('/');

            })
        })
        .catch(err => console.log(err));
    // res.setHeader('Set-Cookie','loggedIn=true') // used to set cookies.
}

exports.LoggedOut = (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect('/');

    });
}
exports.getCreateExpenditure = (req, res, next) => {
    User.find()
        .then(users => {
            res.render('createExpenditure', {
                pageTitle: "create expenditure",
                path: "/create-expenditure",
                errorsMessage: null,
                csrfToken: req.csrfToken(),
                users: users
            })
        })
        .catch(err => console.log(err))
}
exports.postExpenditure = (req, res, next) => {
    const date = req.body.date;
    const reason = req.body.reason;
    const cost = req.body.cost
    const spendUser = req.body.spendUser;
    const updatedUser = req.session.user._id;

    const dates = new Date(date);
    const month = dates.getMonth();
    const monthName = getMonth(month);
    const fullYear = dates.getFullYear();

    Expenditure.findOne({ expenditureMonth: monthName, expenditureYear: fullYear })
        .then(expend => {
            if (expend) {
                const tempExpend = { date: date, reason: reason, cost: cost, spendUser: spendUser, updatedUser: updatedUser };
                expend.expenditures.push(tempExpend);
                expend.amountSpend += parseInt(tempExpend.cost);
                expend.amountRemaining = parseInt(expend.totalAmount) - parseInt(expend.amountSpend)
                return expend.save()
            } else {

            }
        })
        .then(expend => {
            res.redirect('/');

        })
        .catch(err => console.log(err));

}
exports.postForgotPassword = async (req, res, next) => {
    const email = req.body.email;
    // console.log(req.body);
    try {
        const user = await User.findOne({ email: email });
        user.isPasswordReset = true;
        user.passwordToken = Math.random().toString(36).substring(7);
        user.passwordTokenExpire = new Date();
        const savedUser = await user.save();

        transporter.sendMail({
            from: "papathi-amman@gmail.com",
            to: savedUser.email,
            subject: "Password reset",
            html: `<p> Please click the below link to reset your password</p> <a href="${res.locals.domainName}/password-reset?token=${savedUser.passwordToken}">Click link</a>`
        })
        res.render('user/login', {
            pageTitle: "Log-in",
            path: "/login",
            errorsMessage: null,
            oldDatas: {
                email: "",
                password: ""
            },
            csrfToken: req.csrfToken(),
            passwordReset: "Password reset Link successfully send to your registered mail Id"
        });


    } catch (error) {
        console.log(error);
    }


}

exports.getPasswordReset = async (req, res, next) => {
    const token = req.query.token;
    const user = await User.findOne({ passwordToken: token });
    if (!user) {
        return res.render('user/login', {
            pageTitle: "Log-in",
            path: "/login",
            errorsMessage: [{ msg: "password Token expired ,please try again" }],
            oldDatas: {
                email: "",
                password: ""
            },
            csrfToken: req.csrfToken(),
            passwordReset: null
        });
    }
    const currentDate = new Date();
    const tokenDate = new Date(user.passwordTokenExpire);
    var hours = Math.abs(tokenDate - currentDate) / 36e5;
    if (Math.floor(hours) > 24) {
        return res.render('user/passwordReset', {
            pageTitle: "Password reset",
            csrfToken: req.csrfToken(),
            path: 'password-reset',
            message: "Token was expired, Please try again",
            errorsMessage: null,
            user: user
        })
    }
    console.log(user.email)
    res.render('user/passwordReset', {
        pageTitle: "Password reset",
        csrfToken: req.csrfToken(),
        path: 'password-reset',
        message: null,
        errorsMessage: null,
        user: user
    })
}

exports.postResetPassword = async (req, res, next) => {

    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.render('user/login', {
                pageTitle: "Log-in",
                path: "/login",
                errorsMessage: [{ msg: "Token expired" }],
                oldDatas: {
                    email: "",
                    password: ""
                },
                csrfToken: req.csrfToken(),
                passwordReset: ""
            });
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.render('user/passwordReset', {
                pageTitle: "Password reset",
                csrfToken: req.csrfToken(),
                path: 'password-reset',
                message: null,
                errorsMessage: errors.array(),
                user: user
            })
        }
        if (!user.isPasswordReset) {
            throw new Error("Please click forgot password in login page to reset your password");
        }
        const hashed = await bcrypt.hash(password, 12);
        user.password = hashed;
        user.passwordTokenExpire = "";
        user.passwordToken = "";
        user.isPasswordReset = false;
        const savedUser = await user.save();
        res.redirect('/log-in');
    } catch (error) {
        console.log(error);
    }



}

exports.getProfile = async (req, res, next) => {
    const user = await User.findOne({ email: req.session.user.email })
        .populate(['transactions', 'orders'])
console.log(user)
    res.render('user/profile', {
        pageTitle: "Profile",
        csrfToken: req.csrfToken(),
        path: '/profile',
        message: null,
        errorsMessage: null,
        user: user
    })
}

const getMonth = (val) => {
    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    return months[val];

}