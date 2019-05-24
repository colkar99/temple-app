const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    orderAmount:{
        type: Number,
        required: true
    },
    orderDate:{
        type: String,
        required: true
    },
    payment:{
        type: Boolean,
        default:false
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    transaction: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},{timestamps: true})



module.exports = mongoose.model('Order',orderSchema);