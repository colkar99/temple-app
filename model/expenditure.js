const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenditureSchema = new Schema({
    expenditureMonth: {
        type: String,
        required: true
    },
    expenditureYear: {
        type: String,
        required: true
    },
    expenditures: [{
        date: {
            type: String,
            required: true 
        },
        reason: {
            type: String,
            required: true
        },
        cost: {
            type: String,
            required: true
        },
        spendUser:{
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        updatedUser: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
    }],
    transactions:[{
        type: Schema.Types.ObjectId,
        ref: "Transaction"
    }],
    totalAmount: {
        type: Number,
        default:0
    },
    amountSpend: {
        type: Number,
        default:0
    },
    amountRemaining:{
        type: Number,
        default:0
    }
},{timestamps: true})

module.exports = mongoose.model('Expenditure',expenditureSchema)