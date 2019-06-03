const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const ObjectId = Schema.ObjectId;

const userSchema = new Schema({
    firstName: {
        type: String,
        default:"",
        required: true
    },
    lastName: {
        type: String,
        default:"",
        required: true 
    },
    fullName: {
        type: String,
        default:"",
        // required: true 
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    phoneNumber:{
        type: String,
        default:"",
        // required: true
    },
    imageUrl:{
        type: String,
        default: null
    },
    orders: [{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }],
    transactions: [{
        type: Schema.Types.ObjectId,
        ref: 'Transaction'
    }],
    isPasswordReset: {
        type: Boolean,
        default:false
    },
    passwordToken:{
        type: String,
        default:null
    },
    passwordTokenExpire:{
        type: String,
        default:null
    }
},{timestamps: true})

module.exports = mongoose.model('User',userSchema )