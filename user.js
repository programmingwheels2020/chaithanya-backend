const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    chatId: { type: Number, required: true },
    activatedStatus: { type: Boolean, required: true },
    adminStatus: { type: Boolean, default: false },
    treasurer: { type: Boolean, default: false },
    password: { type: String },
    openingArrier: { type: Number }
})

module.exports = mongoose.model("User", UserSchema);