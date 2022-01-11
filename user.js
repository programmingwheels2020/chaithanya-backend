const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    chatId: { type: Number, required: true },
})

module.exports = mongoose.model("User", UserSchema);