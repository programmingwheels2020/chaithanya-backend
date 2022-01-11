const mongoose = require("mongoose")

const PaymentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    fileName: { type: String, required: true },
    chatId: { type: Number },
    amount: { type: Number, required: true }
})

module.exports = mongoose.model("Payment", PaymentSchema);