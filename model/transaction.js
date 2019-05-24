const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
        },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
        
    },
    txnPaymentId: {
        type: String
    },
    BankTxnId: {
        type: String
    },
    totalAmount: {
        type: String
    },
    currency: {
        type: String
    },
    paymentStatus: {
        type: String
    },
    resCode: {
        type: String
    },
    resMessage: {
        type: String
    },
    paymentTxnDate: {
        type: String
    },
    gateWayName: {
        type: String
    },
    bankName: {
        type: String
    },
    paymentMode: {
        type: String
    },
    billNo: {
        type: String
    },
    cardLastNo: {
        type: String
    }
}, { timestamps: true })


module.exports = mongoose.model('Transaction', transactionSchema)