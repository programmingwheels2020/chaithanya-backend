const mongoose = require("mongoose")

const PaymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, required: true },
    fileName: { type: String, required: true },
    chatId: { type: Number },
    amount: { type: Number, required: true },
    feeType: { type: Number },
    approveStatus: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = mongoose.model("Payment", PaymentSchema);