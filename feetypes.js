const mongoose = require("mongoose")

const FeeTypeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    typeno: { type: Number, required: true }
})

module.exports = mongoose.model("FeeType", FeeTypeSchema);