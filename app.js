const express = require('express'); // express library
const path = require('path');
const bodyParser = require('body-parser'); // used for data posting
const ejs = require('ejs') // Import ejs library
const mongoose = require('mongoose');
const session = require('express-session');
const csurf = require('csurf');
require("dotenv").config();

////Imports routers////
const indexRouter = require('./router/index'); // import index router 
const userRouter = require('./router/user');
const orderRouter = require('./router/order');
///for paytm integeration
const paytmRouter = require('./router/paytm');

const MongoDbStore = require('connect-mongodb-session')(session); // used to store cookies on server side using sessions
/////
const MONGODB_URI = "mongodb+srv://karthik:colkar.99@node-complete-ycjff.mongodb.net/test?retryWrites=true"

const app = express();
 

const store = new MongoDbStore({
    uri: MONGODB_URI,
    collection: "sessions"
});

app.set('view engine', 'ejs'); // setting view engine as ejs
app.set('views', path.join(__dirname, 'views')); // Setting view folder path
app.use(bodyParser.urlencoded({ extended: false }));// used for accept data input type by default form-data
app.use(bodyParser.json());
app.use(session(
    { secret: "my secret", resave: false, saveUninitialized: false, store: store }
)); // used for session cookie

    
app.use(express.static(path.join(__dirname, 'public')));

app.use(paytmRouter);
app.use(csurf()); // protect our form from csrf attack
app.use((req, res, next) => {
    res.locals.isAuth = req.session.isLoggedin;
    res.locals.csrfToken = req.csrfToken();
    res.locals.domainName = "http://localhost:4200";
    next();
})

app.use(indexRouter);
app.use(userRouter);
app.use(orderRouter);



// app.use('/',(req,res,next)=>{
//     res.render('index');
//     // next();
// })
mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
    .then(data => {
        app.listen(4200);
    }).catch(err => console.log(err))
